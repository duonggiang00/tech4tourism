<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Lấy thời gian tháng hiện tại và tháng trước
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // === 1. STATS CARDS ===
        
        // Booking tháng này
        $bookingsThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $bookingsLastMonth = Booking::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $bookingChange = $bookingsLastMonth > 0 
            ? round((($bookingsThisMonth - $bookingsLastMonth) / $bookingsLastMonth) * 100, 1) 
            : 0;

        // Doanh thu tháng này
        $revenueThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', [1, 3]) // Đã xác nhận hoặc hoàn thành
            ->sum('final_price');
        $revenueLastMonth = Booking::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->whereIn('status', [1, 3])
            ->sum('final_price');
        $revenueChange = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) 
            : 0;

        // Khách hàng mới tháng này (role = 0)
        $newCustomers = User::where('role', 0)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();
        $newCustomersLastMonth = User::where('role', 0)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $customerChange = $newCustomersLastMonth > 0 
            ? round((($newCustomers - $newCustomersLastMonth) / $newCustomersLastMonth) * 100, 1) 
            : 0;

        // Tour đang hoạt động
        $activeTours = Tour::count();

        // === 2. BIỂU ĐỒ DOANH THU 6 THÁNG ===
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $revenue = Booking::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->whereIn('status', [1, 3])
                ->sum('final_price');
            
            $revenueChart[] = [
                'month' => $month->format('m/Y'),
                'monthName' => 'T' . $month->format('m'),
                'revenue' => (float) $revenue,
            ];
        }

        // === 3. BOOKING THEO TRẠNG THÁI ===
        $bookingsByStatus = [
            ['name' => 'Chờ xử lý', 'value' => Booking::where('status', 0)->count(), 'color' => '#eab308'],
            ['name' => 'Đã xác nhận', 'value' => Booking::where('status', 1)->count(), 'color' => '#22c55e'],
            ['name' => 'Đã hủy', 'value' => Booking::where('status', 2)->count(), 'color' => '#ef4444'],
            ['name' => 'Hoàn thành', 'value' => Booking::where('status', 3)->count(), 'color' => '#3b82f6'],
        ];

        // === 4. BOOKING MỚI NHẤT ===
        $latestBookings = Booking::with('tour:id,title')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'code', 'client_name', 'client_email', 'tour_id', 'status', 'final_price', 'created_at']);

        // === 5. TOUR PHỔ BIẾN NHẤT ===
        $popularTours = Tour::withCount('bookings')
            ->orderBy('bookings_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'bookings_count']);
        
        $maxBookings = $popularTours->max('bookings_count') ?: 1;
        $popularTours = $popularTours->map(function ($tour) use ($maxBookings) {
            return [
                'id' => $tour->id,
                'title' => $tour->title,
                'bookings_count' => $tour->bookings_count,
                'percentage' => round(($tour->bookings_count / $maxBookings) * 100),
            ];
        });

        // === 6. CẢNH BÁO CẦN XỬ LÝ ===
        $alerts = [
            [
                'type' => 'warning',
                'icon' => 'clock',
                'message' => 'Booking đang chờ xác nhận',
                'count' => Booking::where('status', 0)->count(),
                'link' => '/admin/bookings?status=0',
            ],
            [
                'type' => 'danger',
                'icon' => 'alert',
                'message' => 'Booking đã hủy',
                'count' => Booking::where('status', 2)->count(),
                'link' => '/admin/bookings?status=2',
            ],
        ];

        // === 7. TOUR SẮP KHỞI HÀNH (giả định có date_start trong booking) ===
        // Lấy các booking có ngày khởi hành trong 7 ngày tới
        $upcomingBookings = Booking::with('tour:id,title,day')
            ->where('status', 1) // Đã xác nhận
            ->whereBetween('created_at', [$now, $now->copy()->addDays(30)])
            ->orderBy('created_at', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'bookings' => [
                    'value' => $bookingsThisMonth,
                    'change' => $bookingChange,
                    'label' => 'Booking tháng này',
                ],
                'revenue' => [
                    'value' => $revenueThisMonth,
                    'change' => $revenueChange,
                    'label' => 'Doanh thu tháng này',
                ],
                'customers' => [
                    'value' => $newCustomers,
                    'change' => $customerChange,
                    'label' => 'Khách hàng mới',
                ],
                'tours' => [
                    'value' => $activeTours,
                    'label' => 'Tour đang hoạt động',
                ],
            ],
            'revenueChart' => $revenueChart,
            'bookingsByStatus' => $bookingsByStatus,
            'latestBookings' => $latestBookings,
            'popularTours' => $popularTours,
            'alerts' => $alerts,
            'upcomingBookings' => $upcomingBookings,
        ]);
    }
}
