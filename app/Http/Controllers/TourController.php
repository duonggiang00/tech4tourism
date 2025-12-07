<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tour;
use App\Models\TourTemplate;
use App\Models\TourInstance;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TourController extends Controller
{
    public function index(Request $request)
    {
        $query = TourTemplate::with(['instances', 'category']);

        // Tìm kiếm theo title
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        // Lọc theo danh mục
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo trạng thái (lọc tour có instance với trạng thái này)
        if ($request->filled('status')) {
            $status = $request->status;
            $query->whereHas('instances', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        // Phân trang
        $templates = $query->latest()->paginate(15)->withQueryString();

        $categories = Category::latest()->get();
        $destinations = Destination::all();

        // Giữ $tours để backward compatibility (chỉ lấy data từ pagination)
        $tours = $templates->items();

        return Inertia::render('Tours/index', compact('tours', 'templates', 'categories', 'destinations'));
    }

    public function create()
    {
        $categories = Category::all();
        $policies = Policy::all();

        // Lấy danh sách HDV (role=2) kèm thông tin đã có tour hay chưa
        // Chỉ lấy assignment của tour/instance còn tồn tại (chưa bị xóa)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1']) // Chờ hoặc Đang thực hiện
            ->where(function ($query) {
                // Template-level: kiểm tra TourTemplate còn tồn tại (chưa bị soft delete)
                $query->where(function ($q) {
                    $q->whereNotNull('tour_id')
                        ->whereNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_templates')
                                ->whereColumn('tour_templates.id', 'trip_assignments.tour_id')
                                ->whereNull('tour_templates.deleted_at');
                        });
                })
                    // Instance-level: kiểm tra TourInstance và TourTemplate còn tồn tại
                    ->orWhere(function ($q) {
                    $q->whereNotNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_instances')
                                ->join('tour_templates', 'tour_instances.tour_template_id', '=', 'tour_templates.id')
                                ->whereColumn('tour_instances.id', 'trip_assignments.tour_instance_id')
                                ->whereNull('tour_instances.deleted_at')
                                ->whereNull('tour_templates.deleted_at');
                        });
                });
            })
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
        // dd($request->all());
        Log::info('------------ BẮT ĐẦU TẠO TOUR ------------');
        Log::info('Request All:', $request->all());
        Log::info('Request Files:', $request->allFiles());
        if ($request->hasFile('gallery_images')) {
            Log::info('Gallery Images detected:', array_map(function ($f) {
                return $f->getClientOriginalName();
            }, $request->file('gallery_images')));
        } else {
            Log::info('NO Gallery Images detected.');
        }

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

            // --- B. LOẠI BỎ CÁC FIELD INSTANCE (nếu có) ---
            // Các field instance sẽ được tạo riêng ở TourInstances/Create
            // Lưu guide_ids trước khi unset để xử lý sau
            $guideIds = $data['guide_ids'] ?? [];
            // Giữ lại price_adult và price_children cho template (giá mặc định)
            // Chỉ unset các field của instance
            unset($data['date_start'], $data['date_end'], $data['limit'], $data['status'], $data['guide_ids']);

            // --- C. TẠO TOUR TEMPLATE ---
            $template = TourTemplate::create($data);
            Log::info('TourTemplate created ID: ' . $template->id);

            // --- D. XỬ LÝ GALLERY IMAGES ---
            if ($request->hasFile('gallery_images')) {
                Log::info('Processing Gallery Images...');
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('tour_images', 'public');
                    TourImages::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
                        'img_url' => $path,
                        'alt' => $template->title,
                        'order' => $index,
                    ]);
                }
            }

            // --- E. XỬ LÝ LỊCH TRÌNH (SCHEDULES) ---
            if (!empty($data['schedules'])) {
                Log::info('Processing Schedules...', ['count' => count($data['schedules'])]);
                foreach ($data['schedules'] as $s) {
                    TourSchedule::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
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
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
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
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
                        'policy_id' => $polId
                    ]);
                }
            }

            // --- H. XỬ LÝ HƯỚNG DẪN VIÊN (Lưu vào template level) ---
            if (!empty($guideIds)) {
                Log::info('Processing Guides...', ['ids' => $guideIds]);
                foreach ($guideIds as $guideId) {
                    TripAssignment::create([
                        'tour_id' => $template->id, // Backward compatibility
                        'tour_instance_id' => null, // Template level, chưa có instance
                        'user_id' => $guideId,
                        'status' => '0', // Chờ xác nhận
                    ]);
                }
            }

            DB::commit();
            Log::info('------------ TẠO TOUR TEMPLATE THÀNH CÔNG ------------');

            // Redirect đến trang tạo instance
            return redirect()->route('tour-instances.create', ['tour' => $template->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('!!!!!! LỖI KHI TẠO TOUR !!!!!!');
            Log::error('Message: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ' at line ' . $e->getLine());

            return back()->withErrors(['error' => 'Lỗi hệ thống: ' . $e->getMessage()])->withInput();
        }
    }

    public function show($tour)
    {
        // Log để debug
        Log::info('TourController::show called', [
            'tour_type' => gettype($tour),
            'tour_value' => is_object($tour) ? get_class($tour) : $tour,
            'tour_id' => is_object($tour) && isset($tour->id) ? $tour->id : null,
        ]);

        // Hỗ trợ cả Tour và TourTemplate
        if ($tour instanceof TourTemplate) {
            $template = $tour;
        } elseif ($tour instanceof Tour) {
            // Tìm TourTemplate tương ứng
            $template = TourTemplate::find($tour->id) ?? TourTemplate::where('title', $tour->title)->first();
            if (!$template) {
                // Fallback: dùng Tour cũ
                $template = $tour;
            }
        } else {
            // Nếu là ID (string hoặc int)
            $tourId = is_numeric($tour) ? (int) $tour : $tour;
            $template = TourTemplate::find($tourId);

            // Nếu không tìm thấy TourTemplate, thử tìm Tour cũ
            if (!$template) {
                $oldTour = Tour::find($tourId);
                if ($oldTour) {
                    // Tìm TourTemplate từ Tour cũ
                    $template = TourTemplate::where('title', $oldTour->title)->first() ?? $oldTour;
                } else {
                    Log::error('Tour not found', ['tour_id' => $tourId]);
                    abort(404, 'Tour không tồn tại');
                }
            }
        }

        if (!$template) {
            Log::error('Template is null after processing', ['tour' => $tour]);
            abort(404, 'Tour không tồn tại');
        }

        Log::info('Template found', ['template_id' => $template->id, 'template_type' => get_class($template)]);

        $availablePolicies = Policy::all();
        $categories = Category::all();
        $destinations = Destination::all();
        $availableServices = Service::all();

        // Lấy danh sách HDV đã được gán cho template này
        $currentGuideIds = TripAssignment::where('tour_id', $template->id)
            ->pluck('user_id')
            ->toArray();

        // Lấy danh sách HDV bận (đã có tour khác đang hoạt động)
        // Chỉ lấy assignment của tour/instance còn tồn tại (chưa bị xóa)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1'])
            ->where('tour_id', '!=', $template->id)
            ->where(function ($query) {
                // Template-level: kiểm tra TourTemplate còn tồn tại (chưa bị soft delete)
                $query->where(function ($q) {
                    $q->whereNotNull('tour_id')
                        ->whereNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_templates')
                                ->whereColumn('tour_templates.id', 'trip_assignments.tour_id')
                                ->whereNull('tour_templates.deleted_at');
                        });
                })
                    // Instance-level: kiểm tra TourInstance và TourTemplate còn tồn tại
                    ->orWhere(function ($q) {
                    $q->whereNotNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_instances')
                                ->join('tour_templates', 'tour_instances.tour_template_id', '=', 'tour_templates.id')
                                ->whereColumn('tour_instances.id', 'trip_assignments.tour_instance_id')
                                ->whereNull('tour_instances.deleted_at')
                                ->whereNull('tour_templates.deleted_at');
                        });
                });
            })
            ->pluck('user_id')
            ->toArray();

        $guides = User::where('role', 2)->get()->map(function ($user) use ($busyGuideIds, $currentGuideIds) {
            $user->has_active_tour = in_array($user->id, $busyGuideIds) && !in_array($user->id, $currentGuideIds);
            return $user;
        });

        // Load relationships
        if ($template instanceof TourTemplate) {
            $template->load([
                'images',
                'schedules.destination',
                'tourServices.service.serviceType',
                'tourPolicies.policy',
                'province.destinations',
                'instances', // Load instances
            ]);

            // Load trip_assignments ở template level (tour_instance_id = null)
            $template->trip_assignments = TripAssignment::where('tour_id', $template->id)
                ->whereNull('tour_instance_id')
                ->with('user')
                ->get();
        } else {
            $template->load([
                'images',
                'schedules.destination',
                'tourServices.service.serviceType',
                'tourPolicies.policy',
                'province.destinations',
                'tripAssignments.user',
            ]);
        }

        // Đảm bảo tour luôn có giá trị (dùng template nếu tour không có)
        $tour = $template;

        return Inertia::render('Tours/detail', compact('tour', 'template', 'categories', 'availableServices', 'availablePolicies', 'destinations', 'guides'));
    }

    public function edit($tour)
    {
        // Hỗ trợ cả Tour và TourTemplate
        if ($tour instanceof TourTemplate) {
            $template = $tour;
        } elseif ($tour instanceof Tour) {
            $template = TourTemplate::find($tour->id) ?? TourTemplate::where('title', $tour->title)->first();
            if (!$template) {
                $template = $tour;
            }
        } else {
            $template = TourTemplate::find($tour) ?? Tour::find($tour);
            if (!$template) {
                abort(404);
            }
        }

        $categories = Category::all();
        $policies = Policy::all();

        // Lấy danh sách HDV đã được gán cho template này
        $currentGuideIds = TripAssignment::where('tour_id', $template->id)
            ->pluck('user_id')
            ->toArray();

        // Lấy danh sách HDV bận (đã có tour khác đang hoạt động)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1'])
            ->where('tour_id', '!=', $template->id)
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

        // Load các quan hệ của template để đổ dữ liệu vào form
        if ($template instanceof TourTemplate) {
            $template->load([
                'images',
                'schedules',
                'tourServices',
                'tourPolicies',
                'instances', // Load instances để hiển thị
            ]);
        } else {
            $template->load([
                'images',
                'schedules',
                'tourServices',
                'tourPolicies',
                'tripAssignments',
            ]);
        }

        // Trả về view edit với dữ liệu đầy đủ
        return Inertia::render('Tours/edit', [
            'tour' => $template, // Pass template as tour for backward compatibility
            'template' => $template,
            'categories' => $categories,
            'policies' => $policies,
            'guides' => $guides,
            'countries' => $countries,
        ]);
    }

    public function update(UpdateTourRequest $request, $tour)
    {
        // Sử dụng StoreTourRequest vì rules validate thường giống nhau (hoặc dùng UpdateTourRequest nếu cần unique rule khác cho title)
        // Hỗ trợ cả Tour và TourTemplate
        if ($tour instanceof TourTemplate) {
            $template = $tour;
        } elseif ($tour instanceof Tour) {
            $template = TourTemplate::find($tour->id) ?? TourTemplate::where('title', $tour->title)->first();
            if (!$template) {
                $template = $tour;
            }
        } else {
            $template = TourTemplate::find($tour) ?? Tour::find($tour);
            if (!$template) {
                abort(404);
            }
        }

        Log::info('------------ BẮT ĐẦU CẬP NHẬT TOUR ------------');
        Log::info('Template ID: ' . $template->id);
        Log::info('Request Data:', $request->all());

        DB::beginTransaction();

        try {
            $data = $request->validated();

            // --- A. XỬ LÝ THUMBNAIL ---
            if ($request->hasFile('thumbnail')) {
                // Xóa ảnh cũ nếu có
                $oldThumbnail = $template->getRawOriginal('thumbnail');
                if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                    Storage::disk('public')->delete($oldThumbnail);
                }
                // Lưu ảnh mới
                $data['thumbnail'] = $request->file('thumbnail')->store('tours', 'public');
                Log::info('Updated thumbnail: ' . $data['thumbnail']);
            } else {
                unset($data['thumbnail']); // Giữ nguyên ảnh cũ
            }

            // --- B. TÁCH DỮ LIỆU: Template vs Instance ---
            // Lưu các field instance để tạo/cập nhật sau
            $instanceData = [];
            if (isset($data['date_start'])) {
                $instanceData = [
                    'date_start' => $data['date_start'],
                    'date_end' => null,
                    'limit' => $data['limit'] ?? null,
                    'price_adult' => $data['price_adult'] ?? null,
                    'price_children' => $data['price_children'] ?? null,
                    'status' => $data['status'] ?? 1,
                ];

                if (isset($data['day'])) {
                    $instanceData['date_end'] = Carbon::parse($instanceData['date_start'])->addDays($data['day'] - 1)->format('Y-m-d');
                }
            }

            // Loại bỏ các field instance khỏi data template
            // Lưu guide_ids trước khi unset để xử lý sau
            // Giữ lại price_adult và price_children cho template (giá mặc định)
            $guideIds = $data['guide_ids'] ?? null;
            unset($data['date_start'], $data['date_end'], $data['limit'], $data['status'], $data['guide_ids']);

            // --- C. CẬP NHẬT THÔNG TIN TEMPLATE ---
            $template->update($data);

            // --- D. XỬ LÝ GALLERY IMAGES (Thêm mới) ---
            // Lưu ý: Xóa ảnh cũ thường làm ở API riêng, ở đây chỉ thêm ảnh mới
            if ($request->hasFile('gallery_images')) {
                // Lấy order lớn nhất hiện tại để append vào cuối
                $maxOrder = $template->images()->max('order') ?? 0;
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('tour_images', 'public');
                    TourImages::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
                        'img_url' => $path,
                        'alt' => $template->title,
                        'order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            // --- E. XỬ LÝ LỊCH TRÌNH (Clean & Re-create) ---
            // Xóa lịch trình cũ và tạo lại để đảm bảo đồng bộ
            if (isset($data['schedules'])) {
                TourSchedule::where('tour_id', $template->id)->delete();
                foreach ($data['schedules'] as $s) {
                    TourSchedule::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
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
                \App\Models\TourService::where('tour_id', $template->id)->delete();
                foreach ($data['tour_services'] as $srv) {
                    \App\Models\TourService::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
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
                \App\Models\TourPolicy::where('tour_id', $template->id)->delete();
                foreach ($data['policy_ids'] as $polId) {
                    \App\Models\TourPolicy::create([
                        'tour_id' => $template->id, // tour_id giờ trỏ đến tour_template_id
                        'policy_id' => $polId
                    ]);
                }
            }

            // --- H1. XỬ LÝ TOUR INSTANCE (nếu có instance data) ---
            $instance = null;
            if (!empty($instanceData) && $instanceData['date_start']) {
                // Tìm instance hiện có hoặc tạo mới
                $instance = $template->instances()->where('date_start', $instanceData['date_start'])->first();

                if ($instance) {
                    // Cập nhật instance hiện có
                    $instance->update($instanceData);
                    Log::info('TourInstance updated ID: ' . $instance->id);
                } else {
                    // Tạo instance mới
                    $instanceData['tour_template_id'] = $template->id;
                    $instanceData['booked_count'] = 0;
                    $instance = TourInstance::create($instanceData);
                    Log::info('TourInstance created ID: ' . $instance->id);
                }
            }

            // --- H2. XỬ LÝ HƯỚNG DẪN VIÊN (Sync logic - Giữ lại dữ liệu cũ) ---
            // Xử lý guide_ids cho template level (tour_instance_id = null)
            if (isset($guideIds) && is_array($guideIds)) {
                $newGuideIds = $guideIds;

                // Lấy danh sách guide hiện tại ở template level (không có instance)
                $currentTemplateAssignments = TripAssignment::where('tour_id', $template->id)
                    ->whereNull('tour_instance_id')
                    ->get();
                $currentTemplateGuideIds = $currentTemplateAssignments->pluck('user_id')->toArray();

                // 1. Thêm HDV mới ở template level
                $toAdd = array_diff($newGuideIds, $currentTemplateGuideIds);
                foreach ($toAdd as $userId) {
                    TripAssignment::create([
                        'tour_id' => $template->id,
                        'tour_instance_id' => null, // Template level
                        'user_id' => $userId,
                        'status' => '0',
                    ]);
                }

                // 2. Xóa HDV bị bỏ chọn ở template level (chỉ xóa nếu chưa có check-ins/notes)
                $toRemove = array_diff($currentTemplateGuideIds, $newGuideIds);
                foreach ($toRemove as $userId) {
                    $assignment = $currentTemplateAssignments->where('user_id', $userId)->first();
                    if ($assignment) {
                        $hasCheckIns = $assignment->tripCheckIns()->exists();
                        $hasNotes = $assignment->tripNotes()->exists();

                        if (!$hasCheckIns && !$hasNotes) {
                            $assignment->delete();
                        } else {
                            $assignment->update(['status' => '3']);
                            Log::warning("Không thể xóa TripAssignment ID {$assignment->id} vì đã có dữ liệu. Đã chuyển sang status=3 (Đã hủy)");
                        }
                    }
                }
            }

            // Xử lý guide_ids cho instance level (nếu có instance)
            if (isset($data['guide_ids']) && $instance) {
                $newGuideIds = $data['guide_ids'];
                $currentAssignments = TripAssignment::where('tour_instance_id', $instance->id)
                    ->orWhere('tour_id', $template->id)
                    ->get();
                $currentGuideIds = $currentAssignments->pluck('user_id')->toArray();

                // 1. Thêm HDV mới (chưa có trong DB)
                $toAdd = array_diff($newGuideIds, $currentGuideIds);
                foreach ($toAdd as $userId) {
                    TripAssignment::create([
                        'tour_id' => $template->id, // Backward compatibility
                        'tour_instance_id' => $instance->id, // Mới
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

            return redirect()->route('tours.show', $tour);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('!!!!!! LỖI KHI CẬP NHẬT TOUR !!!!!!');
            Log::error($e->getMessage());
            return back()->withErrors(['error' => 'Lỗi hệ thống: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy($tour)
    {
        // Hỗ trợ cả Tour và TourTemplate
        if ($tour instanceof TourTemplate) {
            $template = $tour;
        } elseif ($tour instanceof Tour) {
            $template = TourTemplate::find($tour->id) ?? TourTemplate::where('title', $tour->title)->first();
            if (!$template) {
                $template = $tour;
            }
        } else {
            $template = TourTemplate::find($tour) ?? Tour::find($tour);
            if (!$template) {
                abort(404);
            }
        }

        DB::beginTransaction();
        try {
            // 1. Kiểm tra xem có TourInstance nào có booking không
            $instancesWithBookings = TourInstance::where('tour_template_id', $template->id)
                ->whereHas('bookings')
                ->count();

            if ($instancesWithBookings > 0) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Không thể xóa tour đã có booking!']);
            }

            // 2. Xử lý TripAssignment liên quan
            // 2.1. Lấy tất cả instance IDs của template này
            $instanceIds = TourInstance::where('tour_template_id', $template->id)->pluck('id')->toArray();

            // 2.2. Lấy tất cả TripAssignment liên quan:
            // - Template-level: tour_id = template.id và tour_instance_id IS NULL
            // - Instance-level: tour_instance_id IN (instance_ids)
            $allAssignments = TripAssignment::where(function ($query) use ($template, $instanceIds) {
                $query->where(function ($q) use ($template) {
                    // Template-level assignments
                    $q->where('tour_id', $template->id)
                        ->whereNull('tour_instance_id');
                })->orWhere(function ($q) use ($instanceIds) {
                    // Instance-level assignments
                    if (!empty($instanceIds)) {
                        $q->whereIn('tour_instance_id', $instanceIds);
                    }
                });
            })->get();

            // 2.3. Xử lý từng assignment
            foreach ($allAssignments as $assignment) {
                $hasCheckIns = $assignment->tripCheckIns()->exists();
                $hasNotes = $assignment->tripNotes()->exists();

                if (!$hasCheckIns && !$hasNotes) {
                    // An toàn để xóa
                    $assignment->delete();
                } else {
                    // Đánh dấu là đã hủy thay vì xóa
                    $assignment->update(['status' => '3']);
                    Log::info("TripAssignment ID {$assignment->id} đã được chuyển sang status=3 (Đã hủy) khi xóa TourTemplate ID {$template->id}");
                }
            }

            // 3. Xóa ảnh vật lý
            $thumbnail = $template->getRawOriginal('thumbnail');
            if ($thumbnail && Storage::disk('public')->exists($thumbnail)) {
                Storage::disk('public')->delete($thumbnail);
            }

            // 4. Xóa record trong DB (TourInstance sẽ tự động xóa do cascade)
            $template->delete();

            DB::commit();
            Log::info("Đã xóa TourTemplate ID {$template->id} và cập nhật {$allAssignments->count()} TripAssignment");

            return redirect()->route('tours.index')->with('message', 'Xóa tour thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xóa tour: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Có lỗi xảy ra khi xóa tour: ' . $e->getMessage()]);
        }
    }
}