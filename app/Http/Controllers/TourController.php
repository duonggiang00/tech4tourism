<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tour;
use App\Http\Requests\StoreTourRequest;
use App\Http\Requests\UpdateTourRequest;
use App\Models\Country;
use App\Models\Destination;
use App\Models\Policy;
use App\Models\Province;
use App\Models\Service;
use App\Models\TourImages;
use App\Models\TourSchedule;
use App\Models\TripAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TourController extends Controller
{
    public function index()
    {
        $tours = Tour::all();
        $categories = Category::latest()->get();
        $destinations = Destination::all();
        return Inertia::render('Tours/index', compact('tours', 'categories', 'destinations'));
    }

    public function create()
    {
        $categories = Category::all();
        $policies = Policy::all();
        
        // Lấy danh sách HDV (role=2) kèm thông tin đã có tour hay chưa
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1']) // Chờ hoặc Đang thực hiện
            ->pluck('user_id')
            ->toArray();
        
        $guides = User::where('role', 2)->get()->map(function ($user) use ($busyGuideIds) {
            $user->has_active_tour = in_array($user->id, $busyGuideIds);
            return $user;
        });

        // Lấy Quốc gia kèm theo Tỉnh thành
        // NHƯNG: Chỉ lấy những Tỉnh thỏa mãn điều kiện (có xe + có khách sạn)
        $countries = Country::with([
            'provinces' => function ($query) {
                $query->whereHas('providers.services.serviceType', function (Builder $q) {
                    $q->where('name', 'Vận chuyển');
                })
                    ->whereHas('providers.services.serviceType', function (Builder $q) {
                        $q->where('name', 'Khách sạn');
                    })
                    ->with(['destinations', 'providers.services']);
            }
        ])
            // Lọc luôn ở cấp Quốc gia: Chỉ lấy quốc gia nào có ít nhất 1 tỉnh thỏa mãn điều kiện trên
            ->whereHas('provinces', function ($query) {
                $query->whereHas('providers.services.serviceType', function (Builder $q) {
                    $q->where('name', 'Vận chuyển');
                })
                    ->whereHas('providers.services.serviceType', function (Builder $q) {
                        $q->where('name', 'Khách sạn');
                    });
            })
            ->get();

        return Inertia::render('Tours/create', compact('categories', 'policies', 'guides', 'countries'));
    }

    public function store(StoreTourRequest $request)
    {
        Log::info('------------ BẮT ĐẦU TẠO TOUR ------------');
        Log::info('Request Data:', $request->all());

        DB::beginTransaction();

        try {
            $data = $request->validated();

            // --- A. XỬ LÝ THUMBNAIL ---
            if ($request->hasFile('thumbnail')) {
                try {
                    $data['thumbnail'] = $request->file('thumbnail')->store('tours', 'public');
                    Log::info('Thumbnail saved: ' . $data['thumbnail']);
                } catch (\Exception $e) {
                    Log::error('Lỗi upload thumbnail: ' . $e->getMessage());
                    throw $e;
                }
            }

            // --- B. TÍNH NGÀY KẾT THÚC ---
            if (isset($data['date_start']) && isset($data['day'])) {
                $data['date_end'] = Carbon::parse($data['date_start'])->addDays($data['day'] - 1)->format('Y-m-d');
            }

            // --- C. TẠO TOUR ---
            $tour = Tour::create($data);
            Log::info('Tour created ID: ' . $tour->id);

            // --- D. XỬ LÝ GALLERY IMAGES ---
            if ($request->hasFile('gallery_images')) {
                Log::info('Processing Gallery Images...');
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('tour_images', 'public');
                    TourImages::create([
                        'tour_id' => $tour->id,
                        'img_url' => $path,
                        'alt' => $tour->title,
                        'order' => $index,
                    ]);
                }
            }

            // --- E. XỬ LÝ LỊCH TRÌNH (SCHEDULES) ---
            if (!empty($data['schedules'])) {
                Log::info('Processing Schedules...', ['count' => count($data['schedules'])]);
                foreach ($data['schedules'] as $s) {
                    TourSchedule::create([
                        'tour_id' => $tour->id,
                        'destination_id' => $s['destination_id'],
                        'name' => $s['name'],
                        'description' => $s['description'] ?? null,
                        'date' => $s['date'],
                        // Gán mặc định vì frontend đã bỏ form nhập
                        'breakfast' => 0,
                        'lunch' => 0,
                        'dinner' => 0,
                    ]);
                }
            }

            // --- F. XỬ LÝ DỊCH VỤ (SERVICES) ---
            if (!empty($data['tour_services'])) {
                Log::info('Processing Services...', ['count' => count($data['tour_services'])]);

                foreach ($data['tour_services'] as $srv) {
                    \App\Models\TourService::create([
                        'tour_id' => $tour->id,
                        'service_id' => $srv['service_id'],
                        'quantity' => $srv['quantity'],
                        'unit' => $srv['unit'],
                        'price_unit' => $srv['price_unit'],
                        'price_total' => $srv['price_total'],
                        'description' => $srv['description'] ?? null,
                    ]);
                }
            }

            // --- G. XỬ LÝ CHÍNH SÁCH (POLICIES) ---
            if (!empty($data['policy_ids'])) {
                Log::info('Processing Policies...', ['ids' => $data['policy_ids']]);
                foreach ($data['policy_ids'] as $polId) {
                    \App\Models\TourPolicy::create([
                        'tour_id' => $tour->id,
                        'policy_id' => $polId
                    ]);
                }
            }

            // --- H. XỬ LÝ HƯỚNG DẪN VIÊN (GUIDES) ---
            if (!empty($data['guide_ids'])) {
                Log::info('Processing Guides...', ['ids' => $data['guide_ids']]);
                foreach ($data['guide_ids'] as $userId) {
                    TripAssignment::create([
                        'tour_id' => $tour->id,
                        'user_id' => $userId,
                        'status' => '0', // Mặc định: Chờ
                    ]);
                }
            }

            DB::commit();
            Log::info('------------ TẠO TOUR THÀNH CÔNG ------------');

            return redirect()->route('tours.show', $tour);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('!!!!!! LỖI KHI TẠO TOUR !!!!!!');
            Log::error('Message: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ' at line ' . $e->getLine());

            return back()->withErrors(['error' => 'Lỗi hệ thống: ' . $e->getMessage()])->withInput();
        }
    }

    public function show(Tour $tour)
    {
        $availablePolicies = Policy::all();
        $categories = Category::all();
        $destinations = Destination::all();
        $availableServices = Service::all();
        
        // Lấy danh sách HDV đã được gán cho tour hiện tại
        $currentGuideIds = TripAssignment::where('tour_id', $tour->id)
            ->pluck('user_id')
            ->toArray();
        
        // Lấy danh sách HDV bận (đã có tour khác đang hoạt động)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1'])
            ->where('tour_id', '!=', $tour->id)
            ->pluck('user_id')
            ->toArray();
        
        $guides = User::where('role', 2)->get()->map(function ($user) use ($busyGuideIds, $currentGuideIds) {
            $user->has_active_tour = in_array($user->id, $busyGuideIds) && !in_array($user->id, $currentGuideIds);
            return $user;
        });
        
        $tour->load([
            'images',
            'schedules.destination',
            'tourServices.service.serviceType',
            'tourPolicies.policy',
            'province.destinations',
            'tripAssignments.user' // Lưu ý tên quan hệ trong model Tour
        ]);
        return Inertia::render('Tours/detail', compact('tour', 'categories', 'availableServices', 'availablePolicies', 'destinations', 'guides'));
    }

    public function edit(Tour $tour)
    {
        $categories = Category::all();
        $policies = Policy::all();
        
        // Lấy danh sách HDV đã được gán cho tour hiện tại
        $currentGuideIds = TripAssignment::where('tour_id', $tour->id)
            ->pluck('user_id')
            ->toArray();
        
        // Lấy danh sách HDV bận (đã có tour khác đang hoạt động)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1'])
            ->where('tour_id', '!=', $tour->id)
            ->pluck('user_id')
            ->toArray();
        
        $guides = User::where('role', 2)->get()->map(function ($user) use ($busyGuideIds, $currentGuideIds) {
            // HDV bận = đã có tour khác VÀ không phải là HDV đang được chọn cho tour này
            $user->has_active_tour = in_array($user->id, $busyGuideIds) && !in_array($user->id, $currentGuideIds);
            return $user;
        });

        // Logic lấy countries y hệt hàm create để tái sử dụng component LocationSelector
        $countries = Country::with([
            'provinces' => function ($query) {
                $query->whereHas('providers.services.serviceType', function (Builder $q) {
                    $q->where('name', 'Vận chuyển');
                })
                    ->whereHas('providers.services.serviceType', function (Builder $q) {
                        $q->where('name', 'Khách sạn');
                    })
                    ->with(['destinations', 'providers.services']);
            }
        ])
            ->whereHas('provinces', function ($query) {
                $query->whereHas('providers.services.serviceType', function (Builder $q) {
                    $q->where('name', 'Vận chuyển');
                })
                    ->whereHas('providers.services.serviceType', function (Builder $q) {
                        $q->where('name', 'Khách sạn');
                    });
            })
            ->get();

        // Load các quan hệ của tour để đổ dữ liệu vào form
        $tour->load([
            'images',
            'schedules',
            'tourServices', // Quan hệ hasMany trong model Tour
            'tourPolicies',
            'tripAssignments' // Quan hệ hasMany
        ]);

        // Trả về view edit với dữ liệu đầy đủ
        return Inertia::render('Tours/edit', compact('tour', 'categories', 'policies', 'guides', 'countries'));
    }

    public function update(UpdateTourRequest $request, Tour $tour)
    {
        // Sử dụng StoreTourRequest vì rules validate thường giống nhau (hoặc dùng UpdateTourRequest nếu cần unique rule khác cho title)
        Log::info('------------ BẮT ĐẦU CẬP NHẬT TOUR ------------');
        Log::info('Tour ID: ' . $tour->id);
        Log::info('Request Data:', $request->all());

        DB::beginTransaction();

        try {
            $data = $request->validated();

            // --- A. XỬ LÝ THUMBNAIL ---
            if ($request->hasFile('thumbnail')) {
                // Xóa ảnh cũ nếu có
                $oldThumbnail = $tour->getRawOriginal('thumbnail');
                if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                    Storage::disk('public')->delete($oldThumbnail);
                }
                // Lưu ảnh mới
                $data['thumbnail'] = $request->file('thumbnail')->store('tours', 'public');
                Log::info('Updated thumbnail: ' . $data['thumbnail']);
            } else {
                unset($data['thumbnail']); // Giữ nguyên ảnh cũ
            }

            // --- B. TÍNH NGÀY KẾT THÚC ---
            if (isset($data['date_start']) && isset($data['day'])) {
                $data['date_end'] = Carbon::parse($data['date_start'])->addDays($data['day'] - 1)->format('Y-m-d');
            }

            // --- C. CẬP NHẬT THÔNG TIN CƠ BẢN ---
            $tour->update($data);

            // --- D. XỬ LÝ GALLERY IMAGES (Thêm mới) ---
            // Lưu ý: Xóa ảnh cũ thường làm ở API riêng, ở đây chỉ thêm ảnh mới
            if ($request->hasFile('gallery_images')) {
                // Lấy order lớn nhất hiện tại để append vào cuối
                $maxOrder = $tour->images()->max('order') ?? 0;
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('tour_images', 'public');
                    TourImages::create([
                        'tour_id' => $tour->id,
                        'img_url' => $path,
                        'alt' => $tour->title,
                        'order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            // --- E. XỬ LÝ LỊCH TRÌNH (Clean & Re-create) ---
            // Xóa lịch trình cũ và tạo lại để đảm bảo đồng bộ
            if (isset($data['schedules'])) {
                TourSchedule::where('tour_id', $tour->id)->delete();
                foreach ($data['schedules'] as $s) {
                    TourSchedule::create([
                        'tour_id' => $tour->id,
                        'destination_id' => $s['destination_id'],
                        'name' => $s['name'],
                        'description' => $s['description'] ?? null,
                        'date' => $s['date'],
                        'breakfast' => 0,
                        'lunch' => 0,
                        'dinner' => 0,
                    ]);
                }
            }

            // --- F. XỬ LÝ DỊCH VỤ (Clean & Re-create) ---
            if (isset($data['tour_services'])) {
                \App\Models\TourService::where('tour_id', $tour->id)->delete();
                foreach ($data['tour_services'] as $srv) {
                    \App\Models\TourService::create([
                        'tour_id' => $tour->id,
                        'service_id' => $srv['service_id'],
                        'quantity' => $srv['quantity'],
                        'unit' => $srv['unit'],
                        'price_unit' => $srv['price_unit'],
                        'price_total' => $srv['price_total'],
                        'description' => $srv['description'] ?? null,
                    ]);
                }
            }

            // --- G. XỬ LÝ CHÍNH SÁCH (Clean & Re-create) ---
            if (isset($data['policy_ids'])) {
                \App\Models\TourPolicy::where('tour_id', $tour->id)->delete();
                foreach ($data['policy_ids'] as $polId) {
                    \App\Models\TourPolicy::create([
                        'tour_id' => $tour->id,
                        'policy_id' => $polId
                    ]);
                }
            }

            // --- H. XỬ LÝ HƯỚNG DẪN VIÊN (Sync logic - Giữ lại dữ liệu cũ) ---
            if (isset($data['guide_ids'])) {
                $newGuideIds = $data['guide_ids'];
                $currentAssignments = TripAssignment::where('tour_id', $tour->id)->get();
                $currentGuideIds = $currentAssignments->pluck('user_id')->toArray();

                // 1. Thêm HDV mới (chưa có trong DB)
                $toAdd = array_diff($newGuideIds, $currentGuideIds);
                foreach ($toAdd as $userId) {
                    TripAssignment::create([
                        'tour_id' => $tour->id,
                        'user_id' => $userId,
                        'status' => '0',
                    ]);
                }

                // 2. Xóa HDV bị bỏ chọn (chỉ xóa nếu chưa có check-ins/notes)
                $toRemove = array_diff($currentGuideIds, $newGuideIds);
                foreach ($toRemove as $userId) {
                    $assignment = $currentAssignments->where('user_id', $userId)->first();
                    if ($assignment) {
                        // Kiểm tra xem assignment có dữ liệu liên quan không
                        $hasCheckIns = $assignment->tripCheckIns()->exists();
                        $hasNotes = $assignment->tripNotes()->exists();
                        
                        if (!$hasCheckIns && !$hasNotes) {
                            // An toàn để xóa
                            $assignment->delete();
                        } else {
                            // Đánh dấu là đã hủy thay vì xóa
                            $assignment->update(['status' => '3']);
                            Log::warning("Không thể xóa TripAssignment ID {$assignment->id} vì đã có dữ liệu. Đã chuyển sang status=3 (Đã hủy)");
                        }
                    }
                }
            }

            DB::commit();
            Log::info('------------ CẬP NHẬT TOUR THÀNH CÔNG ------------');

            return redirect()->route('tours.show',$tour);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('!!!!!! LỖI KHI CẬP NHẬT TOUR !!!!!!');
            Log::error($e->getMessage());
            return back()->withErrors(['error' => 'Lỗi hệ thống: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy(Tour $tour)
    {
        // 1. Lấy đường dẫn gốc từ DB
        $thumbnail = $tour->getRawOriginal('thumbnail');

        // 2. Xóa ảnh vật lý trước
        if ($thumbnail && Storage::disk('public')->exists($thumbnail)) {
            Storage::disk('public')->delete($thumbnail);
        }

        // 3. Xóa record trong DB
        $tour->delete();

        return redirect()->route('tours.index')->with('message', 'Xóa tour thành công!');
    }
}