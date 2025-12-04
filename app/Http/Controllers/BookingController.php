<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    // --- KHÁCH HÀNG ---

    // 1. Xử lý đặt tour (POST)

 

    public function create(Request $request)
    {
        // If a specific tour_id is provided (public booking flow), return that tour
        if ($request->filled('tour_id')) {
            $tour = Tour::findOrFail($request->tour_id);

            return Inertia::render('Bookings/Create', [
                'tour' => $tour,
                'date_start' => $request->date_start,
                'adults' => $request->adults,
                'children' => $request->children ?? 0,
            ]);
        }

        // Otherwise, admin wants to create a booking manually: provide list of tours
        $tours = Tour::select('id', 'title', 'price_adult', 'price_children', 'day')->get();

        return Inertia::render('Bookings/Create', [
            'tours' => $tours,
        ]);
    }
    public function store(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        // Quan trọng: 'tour_id' phải có trong rules để được phép đi qua validated()
        $validated = $request->validate([
            'tour_id' => 'required|exists:tours,id',
            'date_start' => 'nullable|date', // Cho phép null, nếu không có sẽ dùng ngày hiện tại
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
            'tour_id.required' => 'Vui lòng chọn tour du lịch.',
            'passengers.required' => 'Danh sách hành khách không được để trống.',
        ]);

        try {
            DB::beginTransaction(); // Bắt đầu Transaction để đảm bảo toàn vẹn dữ liệu

            // Lấy thông tin tour để tính toán
            $tour = Tour::findOrFail($validated['tour_id']);

            // Tính tổng tiền
            $totalPrice = ($tour->price_adult * $validated['adults']) +
                ($tour->price_children * ($validated['children'] ?? 0));

            // // Tính ngày kết thúc = ngày bắt đầu + số ngày tour - 1
            // $dateEnd = Carbon::parse($validated['date_start'])
            //     ->addDays($tour->day > 0 ? $tour->day - 1 : 0);

            // Tạo Booking
            // Lưu ý: Sử dụng mảng $validated để an toàn, nhưng gán đè các giá trị tính toán
            $booking = Booking::create([
                'code' => 'BK-' . strtoupper(Str::random(8)), // Mã booking ngẫu nhiên
                'tour_id' => $tour->id, // FIX LỖI: Dùng đúng tên cột trong DB

                'date_start' => $validated['date_start'] ?? Carbon::now()->format('Y-m-d'),
                // 'date_end' => $dateEnd,

                'client_name' => $validated['client_name'],
                'client_phone' => $validated['client_phone'],
                'client_email' => $validated['client_email'],

                'count_adult' => $validated['adults'],
                'count_children' => $validated['children'] ?? 0,

                'final_price' => $totalPrice,
                // 'left_payment' => $totalPrice, // Mới đặt chưa thanh toán -> Nợ 100%
                'status' => 0, // 0: Pending
            ]);

            // Lưu danh sách hành khách
            // Sử dụng createMany để insert nhanh hơn nếu quan hệ là hasMany
            $booking->passengers()->createMany($validated['passengers']);

            DB::commit(); // Lưu tất cả vào DB

            // --- Điều hướng sau khi thành công ---

            // Kiểm tra nếu request đến từ route admin
            $routeName = $request->route() ? $request->route()->getName() : null;

            if ($routeName && str_starts_with($routeName, 'admin.')) {
                return redirect()->route('admin.bookings.index')
                    ->with('success', 'Tạo booking mới thành công!');
            }

            // Nếu là khách hàng đặt public
            return redirect()->route('booking.success', $booking->code)
                ->with('success', 'Đặt tour thành công! Vui lòng kiểm tra email.');

        } catch (\Exception $e) {
            DB::rollBack(); // Hoàn tác nếu có lỗi

            // Log lỗi để debug (khuyên dùng)
            // \Log::error('Booking Error: ' . $e->getMessage());

            return back()->with('error', 'Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    // --- ADMIN / QUẢN LÝ ---

    // 2. Danh sách Booking (Admin)
    public function index(Request $request)
    {
        $bookings = Booking::with('tour') // Load kèm tên tour
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                        ->orWhere('client_email', 'like', "%{$search}%")
                        ->orWhere('client_phone', 'like', "%{$search}%")
                        // Tìm kiếm theo tên tour
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

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // 3. Xem chi tiết Booking
    public function show(Booking $booking)
    {
        $booking->load(['tour', 'passengers', 'payments']);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking
        ]);
    }

    // 4. Cập nhật trạng thái Booking
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|integer|in:0,1,2,3', // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
        ]);

        $booking->update($validated);

        return back()->with('success', 'Cập nhật trạng thái booking thành công.');
    }

    // 5. Xóa Booking (Soft delete)
    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('admin.bookings.index')
            ->with('success', 'Xóa booking thành công.');
    }
}