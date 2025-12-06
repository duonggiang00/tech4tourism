<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourInstance;
use App\Models\TourTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    // --- KHÁCH HÀNG ---

    // 1. Xử lý đặt tour (POST)

 

    public function create(Request $request)
    {
        // Nếu có tour_instance_id, lấy instance
        if ($request->filled('tour_instance_id')) {
            $instance = TourInstance::with('tourTemplate')->findOrFail($request->tour_instance_id);
            return Inertia::render('Bookings/Create', [
                'tourInstance' => $instance,
                'tour' => $instance->tourTemplate,
                'adults' => $request->adults,
                'children' => $request->children ?? 0,
            ]);
        }

        // Nếu có tour_id (backward compatibility), tìm instances
        if ($request->filled('tour_id')) {
            $template = TourTemplate::find($request->tour_id);
            if ($template) {
                $instances = $template->instances()->where('date_start', '>=', now())->get();
                return Inertia::render('Bookings/Create', [
                    'tour' => $template,
                    'instances' => $instances,
                    'adults' => $request->adults,
                    'children' => $request->children ?? 0,
                ]);
            }
            // Fallback: dùng Tour cũ
            $tour = Tour::findOrFail($request->tour_id);
            return Inertia::render('Bookings/Create', [
                'tour' => $tour,
                'adults' => $request->adults,
                'children' => $request->children ?? 0,
            ]);
        }

        // Admin tạo booking: hiển thị danh sách tour templates với instances
        $templates = TourTemplate::with(['instances' => function($q) {
            $q->where('date_start', '>=', now());
        }])->get();

        return Inertia::render('Bookings/Create', [
            'templates' => $templates,
        ]);
    }
    public function store(Request $request)
    {
        // Log request để debug
        \Log::info('Booking Store Request:', [
            'url' => $request->url(),
            'route_name' => $request->route()?->getName(),
            'data' => $request->all(),
        ]);

        // 1. Validate dữ liệu đầu vào
        // Cho phép cả tour_instance_id (mới) hoặc tour_id (backward compatibility)
        $validated = $request->validate([
            'tour_instance_id' => 'required_without:tour_id|nullable|exists:tour_instances,id',
            'tour_id' => 'required_without:tour_instance_id|nullable|exists:tours,id', // Backward compatibility
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:20',
            'client_email' => 'required|email|max:255',
            'passengers' => 'required|array|min:1', // Phải có ít nhất 1 hành khách
            'passengers.*.fullname' => 'required|string|max:255',
            'passengers.*.cccd' => 'nullable|string|max:20',
            'passengers.*.gender' => 'required|in:0,1',
            'passengers.*.type' => 'required|in:0,1,2', // 0: Adult, 1: Child, 2: Infant
        ], [
            'tour_instance_id.required_without' => 'Vui lòng chọn tour du lịch.',
            'tour_id.required_without' => 'Vui lòng chọn tour du lịch.',
            'passengers.required' => 'Danh sách hành khách không được để trống.',
        ]);

        try {
            DB::beginTransaction(); // Bắt đầu Transaction để đảm bảo toàn vẹn dữ liệu

            // Lấy TourInstance (ưu tiên) hoặc Tour (backward compatibility)
            $tourInstance = null;
            $tour = null;
            $template = null;
            
            if (!empty($validated['tour_instance_id'])) {
                $tourInstance = TourInstance::with('tourTemplate')->findOrFail($validated['tour_instance_id']);
                $template = $tourInstance->tourTemplate;
                
                // Kiểm tra còn chỗ không
                if ($tourInstance->isFull()) {
                    return back()->withErrors(['tour_instance_id' => 'Chuyến đi đã hết chỗ!']);
                }
            } elseif (!empty($validated['tour_id'])) {
                // Chỉ có tour_id (template) - tự động chọn instance phù hợp
                $template = TourTemplate::findOrFail($validated['tour_id']);
                
                // Logic chọn instance:
                // 1. Ưu tiên instance có booking (booked_count > 0) và status = 1 (Sắp có)
                $tourInstance = $template->instances()
                    ->where('status', 1)
                    ->where('booked_count', '>', 0)
                    ->where('date_start', '>=', now())
                    ->orderBy('date_start', 'asc')
                    ->first();
                
                // 2. Nếu không có, chọn instance sắp tới nhất (status = 1, date_start >= today)
                if (!$tourInstance) {
                    $tourInstance = $template->instances()
                        ->where('status', 1)
                        ->where('date_start', '>=', now())
                        ->orderBy('date_start', 'asc')
                        ->first();
                }
                
                // 3. Nếu vẫn không có, chọn instance đầu tiên có sẵn (status = 1)
                if (!$tourInstance) {
                    $tourInstance = $template->instances()
                        ->where('status', 1)
                        ->orderBy('date_start', 'asc')
                        ->first();
                }
                
                if (!$tourInstance) {
                    return back()->withErrors(['tour_id' => 'Tour này chưa có chuyến đi nào khả dụng.']);
                }
                
                // Kiểm tra còn chỗ không
                if ($tourInstance->isFull()) {
                    return back()->withErrors(['tour_id' => 'Chuyến đi đã hết chỗ!']);
                }
            } else {
                return back()->withErrors(['tour_id' => 'Vui lòng chọn tour du lịch.']);
            }

            // Tính tổng tiền từ TourInstance hoặc Tour
            if ($tourInstance) {
                $basePrice = ($tourInstance->price_adult * $validated['adults']) +
                    ($tourInstance->price_children * ($validated['children'] ?? 0));
            } elseif ($tour) {
                $basePrice = ($tour->price_adult * $validated['adults']) +
                    ($tour->price_children * ($validated['children'] ?? 0));
            } else {
                throw new \Exception('Không tìm thấy thông tin giá tour');
            }

            // Xử lý giảm giá
            $discountAmount = 0;
            $discountPercent = null;
            
            if ($request->filled('discount_percent') && $request->discount_percent > 0) {
                // Giảm giá theo phần trăm
                $discountPercent = min(100, max(0, $request->discount_percent));
                $discountAmount = ($basePrice * $discountPercent) / 100;
            } elseif ($request->filled('discount_amount') && $request->discount_amount > 0) {
                // Giảm giá theo số tiền
                $discountAmount = min($basePrice, max(0, $request->discount_amount));
            }

            $finalPrice = max(0, $basePrice - $discountAmount);

            // Tạo Booking
            $booking = Booking::create([
                'code' => 'BK-' . strtoupper(Str::random(8)), // Mã booking ngẫu nhiên
                'tour_id' => $template ? $template->id : ($tour ? $tour->id : null), // Backward compatibility
                'tour_instance_id' => $tourInstance ? $tourInstance->id : null, // Mới

                'client_name' => $validated['client_name'],
                'client_phone' => $validated['client_phone'],
                'client_email' => $validated['client_email'],

                'count_adult' => $validated['adults'],
                'count_children' => $validated['children'] ?? 0,

                'final_price' => $finalPrice,
                'discount_amount' => $discountAmount,
                'discount_percent' => $discountPercent,
                'status' => 0, // 0: Pending
            ]);

            // Tăng booked_count nếu có instance
            if ($tourInstance) {
                $tourInstance->increment('booked_count', $validated['adults'] + ($validated['children'] ?? 0));
            }

            // Lưu danh sách hành khách
            // Sử dụng createMany để insert nhanh hơn nếu quan hệ là hasMany
            $booking->passengers()->createMany($validated['passengers']);

            DB::commit(); // Lưu tất cả vào DB

            \Log::info('Booking created successfully:', [
                'booking_id' => $booking->id,
                'booking_code' => $booking->code,
                'tour_instance_id' => $booking->tour_instance_id,
                'tour_id' => $booking->tour_id,
                'passengers_count' => $booking->passengers()->count(),
            ]);

            // --- Điều hướng sau khi thành công ---
            // Kiểm tra nếu request đến từ route admin (URL chứa /admin/bookings)
            $isAdminRoute = str_contains($request->url(), '/admin/bookings') || 
                           ($request->route() && str_contains($request->route()->getName() ?? '', 'admin.bookings'));

            if ($isAdminRoute) {
                return redirect()->route('admin.bookings.index')
                    ->with('success', 'Tạo booking mới thành công!');
            }

            // Nếu là khách hàng đặt public
            return redirect()->route('booking.success', $booking->code)
                ->with('success', 'Đặt tour thành công! Vui lòng kiểm tra email.');

        } catch (\Exception $e) {
            DB::rollBack(); // Hoàn tác nếu có lỗi

            // Log lỗi để debug
            \Log::error('Booking Error: ' . $e->getMessage());
            \Log::error('Booking Error Trace: ' . $e->getTraceAsString());
            \Log::error('Booking Request Data: ', $request->all());

            return back()
                ->withErrors(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()])
                ->withInput();
        }
    }

    // --- ADMIN / QUẢN LÝ ---

    // 2. Danh sách Booking (Admin)
    public function index(Request $request)
    {
        $bookings = Booking::with([
            'tourInstance.tourTemplate', // Load tourTemplate từ instance
            'tour' // Backward compatibility
        ])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                        ->orWhere('client_email', 'like', "%{$search}%")
                        ->orWhere('client_phone', 'like', "%{$search}%")
                        // Tìm kiếm theo tên tour từ tourTemplate
                        ->orWhereHas('tourInstance.tourTemplate', function ($tourQuery) use ($search) {
                            $tourQuery->where('title', 'like', "%{$search}%");
                        })
                        // Backward compatibility: tìm kiếm theo tour cũ
                        ->orWhereHas('tour', function ($tourQuery) use ($search) {
                            $tourQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status !== null && $request->status !== '', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Đảm bảo mỗi booking có tour data (từ tourInstance.tourTemplate hoặc tour)
        $bookings->getCollection()->transform(function ($booking) {
            // Nếu không có tour nhưng có tourInstance.tourTemplate, gán vào tour
            if (!$booking->tour && $booking->tourInstance && $booking->tourInstance->tourTemplate) {
                $booking->setRelation('tour', $booking->tourInstance->tourTemplate);
            }
            return $booking;
        });

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // 3. Xem chi tiết Booking
    public function show(Booking $booking)
    {
        $booking->load(['tourInstance.tourTemplate', 'tour', 'passengers', 'payments']);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking
        ]);
    }

    // 4. Cập nhật trạng thái Booking
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|integer|in:0,1,2,3', // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        // Nếu cập nhật discount, tính lại final_price
        if ($request->filled('discount_amount') || $request->filled('discount_percent')) {
            // Lấy giá gốc (từ tour instance hoặc tour)
            $basePrice = 0;
            if ($booking->tourInstance) {
                $basePrice = ($booking->tourInstance->price_adult * $booking->count_adult) +
                    ($booking->tourInstance->price_children * $booking->count_children);
            } elseif ($booking->tour) {
                $basePrice = ($booking->tour->price_adult * $booking->count_adult) +
                    ($booking->tour->price_children * $booking->count_children);
            }

            $discountAmount = 0;
            if ($request->filled('discount_percent') && $request->discount_percent > 0) {
                $discountAmount = ($basePrice * $request->discount_percent) / 100;
                $validated['discount_percent'] = $request->discount_percent;
            } elseif ($request->filled('discount_amount')) {
                $discountAmount = min($basePrice, $request->discount_amount);
            }

            $validated['discount_amount'] = $discountAmount;
            $validated['final_price'] = max(0, $basePrice - $discountAmount);
        }

        $booking->update($validated);

        return back()->with('success', 'Cập nhật booking thành công.');
    }

    // 5. Xóa Booking (Soft delete)
    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('admin.bookings.index')
            ->with('success', 'Xóa booking thành công.');
    }

    // --- PUBLIC LOOKUP ---

    /**
     * Trang tra cứu booking (form nhập mã)
     */
    public function lookup()
    {
        return Inertia::render('Bookings/Lookup');
    }

    /**
     * Tra cứu booking theo mã
     */
    public function lookupByCode($code)
    {
        $booking = Booking::with(['tourInstance.tourTemplate', 'passengers', 'payments'])
            ->where('code', $code)
            ->first();

        if (!$booking) {
            return Inertia::render('Bookings/Lookup', [
                'error' => 'Không tìm thấy booking với mã: ' . $code,
                'code' => $code,
            ]);
        }

        return Inertia::render('Bookings/LookupResult', [
            'booking' => $booking,
        ]);
    }
}