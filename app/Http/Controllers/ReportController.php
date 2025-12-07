<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\TourInstance;
use App\Models\TourTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Trang báo cáo doanh thu chi tiết
     */
    public function revenue(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Tổng doanh thu
        $totalRevenue = Booking::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [1, 3]) // Đã xác nhận hoặc hoàn thành
            ->sum('final_price');

        // Tổng số booking
        $totalBookings = Booking::whereBetween('created_at', [$start, $end])->count();
        $confirmedBookings = Booking::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [1, 3])
            ->count();

        // Doanh thu theo ngày
        $revenueByDay = Booking::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [1, 3])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_price) as revenue'),
                DB::raw('COUNT(*) as bookings_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Doanh thu theo tour
        $revenueByTour = Booking::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [1, 3])
            ->with('tourInstance.tourTemplate')
            ->select(
                'tour_instance_id',
                DB::raw('SUM(final_price) as revenue'),
                DB::raw('COUNT(*) as bookings_count')
            )
            ->groupBy('tour_instance_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($item) {
                if ($item->tourInstance && $item->tourInstance->tourTemplate) {
                    return [
                        'tour_title' => $item->tourInstance->tourTemplate->title,
                        'date_start' => $item->tourInstance->date_start,
                        'revenue' => $item->revenue,
                        'bookings_count' => $item->bookings_count,
                    ];
                }
                return null;
            })
            ->filter()
            ->take(10);

        // Doanh thu theo trạng thái
        $revenueByStatus = [
            [
                'status' => 0,
                'label' => 'Chờ xử lý',
                'revenue' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 0)
                    ->sum('final_price'),
                'count' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 0)
                    ->count(),
            ],
            [
                'status' => 1,
                'label' => 'Đã xác nhận',
                'revenue' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 1)
                    ->sum('final_price'),
                'count' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 1)
                    ->count(),
            ],
            [
                'status' => 2,
                'label' => 'Đã hủy',
                'revenue' => 0, // Revenue for cancelled bookings should be 0
                'count' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 2)
                    ->count(),
            ],
            [
                'status' => 3,
                'label' => 'Hoàn thành',
                'revenue' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 3)
                    ->sum('final_price'),
                'count' => Booking::whereBetween('created_at', [$start, $end])
                    ->where('status', 3)
                    ->count(),
            ],
        ];

        // Top booking
        $topBookings = Booking::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [1, 3])
            ->with('tourInstance.tourTemplate')
            ->orderByDesc('final_price')
            ->take(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'code' => $booking->code,
                    'client_name' => $booking->client_name,
                    'tour_title' => $booking->tourInstance?->tourTemplate?->title ?? 'N/A',
                    'final_price' => $booking->final_price,
                    'created_at' => $booking->created_at,
                ];
            });

        // Tổng giảm giá
        $totalDiscount = Booking::whereBetween('created_at', [$start, $end])
            ->sum('discount_amount');

        return Inertia::render('Reports/Revenue', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'totalRevenue' => $totalRevenue,
            'totalBookings' => $totalBookings,
            'confirmedBookings' => $confirmedBookings,
            'revenueByDay' => $revenueByDay,
            'revenueByTour' => $revenueByTour,
            'revenueByStatus' => $revenueByStatus,
            'topBookings' => $topBookings,
            'totalDiscount' => $totalDiscount,
        ]);
    }
}

