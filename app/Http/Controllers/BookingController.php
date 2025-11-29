<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

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
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'tour_id' => 'required|exists:tours,id',
            'date_start' => 'required|date',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'client_name' => 'required|string',
            'client_phone' => 'required|string',
            'client_email' => 'required|email',
            'passengers' => 'required|array|min:1', // Mảng danh sách khách
            'passengers.*.fullname' => 'required|string',
        ]);

        try {
            DB::beginTransaction(); // Bắt đầu Transaction (An toàn dữ liệu)

            // Lấy thông tin tour để tính tiền
            $tour = Tour::findOrFail($request->tour_id);

            // Tính tổng tiền
            $totalPrice = ($tour->price_adult * $request->adults) +
                ($tour->price_children * ($request->children ?? 0));

            // Tạo Booking
            $booking = Booking::create([
                'code' => 'BK-' . strtoupper(Str::random(6)), // Tạo mã ngẫu nhiên
                'id_tour_instance' => $tour->id,
                'date_start' => $request->date_start,
                'date_end' => Carbon::parse($request->date_start)->addDays($tour->day),
                'client_name' => $request->client_name,
                'client_phone' => $request->client_phone,
                'client_email' => $request->client_email,
                'count_adult' => $request->adults,
                'count_children' => $request->children ?? 0,
                'final_price' => $totalPrice,
                'left_payment' => $totalPrice, // Mới đặt thì còn nợ 100%
                'status' => 0, // Pending
            ]);

            // Lưu danh sách hành khách
            foreach ($request->passengers as $pax) {
                $booking->passengers()->create([
                    'fullname' => $pax['fullname'],
                    'type' => $pax['type'] ?? 0, // 0: Adult
                    'gender' => $pax['gender'] ?? 0,
                ]);
            }

            DB::commit(); // Lưu vào DB thành công

            // If the request was from admin routes, redirect to admin bookings index
            $routeName = $request->route() ? $request->route()->getName() : null;
            if ($routeName && str_starts_with($routeName, 'admin.')) {
                return redirect()->route('admin.bookings.index')
                    ->with('success', 'Tạo booking mới thành công!');
            }

            return redirect()->route('booking.success', $booking->code)
                ->with('success', 'Đặt tour thành công!');

        } catch (\Exception $e) {
            DB::rollBack(); // Nếu lỗi thì hoàn tác, không lưu gì cả
            return back()->with('error', 'Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    // --- ADMIN / QUẢN LÝ ---

    // 2. Danh sách Booking (Admin)
    public function index(Request $request)
    {
        $bookings = Booking::with('tour') // Load kèm tên tour
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                    ->orWhere('client_email', 'like', "%{$search}%");
            })
            ->when($request->status !== null, function ($query) use ($request) {
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