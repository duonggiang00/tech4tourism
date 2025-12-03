<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourScheduleRequest;
use App\Http\Requests\UpdateTourScheduleRequest;
use App\Models\TourSchedule;
use Illuminate\Http\Request;

class TourScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($tourId)
    {
        $schedules = TourSchedule::with('destination')
        ->where('tour_id', $tourId)
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTourScheduleRequest $request, $tourId)
    {
        // 1. Lấy dữ liệu đã validate từ Request
        $data = $request->validated();

        // 2. Gán tour_id lấy từ URL vào dữ liệu để tạo mối quan hệ
        $data['tour_id'] = $tourId;

        // 3. Tạo mới bản ghi
        $schedule = TourSchedule::create($data);

        return response()->json([
            'message' => 'Thêm lịch trình thành công!',
            'data' => $schedule,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($tourId, $id)
    {
        $schedule = TourSchedule::where('id', $id)
            ->where('tour_id', $tourId)
            ->first();

        if (!$schedule) {
            return response()->json(['message' => 'Không tìm thấy'], 404);
        }

        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     * QUAN TRỌNG: Nhận tham số $tourId và $id thay vì Model Binding để tránh lỗi
     */
    public function update(UpdateTourScheduleRequest $request, $tourId, $id)
    {
        // 1. Tìm lịch trình khớp cả ID và Tour ID (để bảo mật)
        $schedule = TourSchedule::where('id', $id)
            ->where('tour_id', $tourId)
            ->first();

        // 2. Nếu không tìm thấy hoặc sai tour -> báo lỗi 404
        if (!$schedule) {
            return response()->json([
                'message' => 'Không tìm thấy lịch trình hoặc lịch trình không thuộc Tour này.'
            ], 404);
        }

        // 3. Cập nhật dữ liệu
        $schedule->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật lịch trình thành công!',
            'data' => $schedule,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($tourId, $id)
    {
        $schedule = TourSchedule::where('id', $id)
            ->where('tour_id', $tourId)
            ->first();

        if (!$schedule) {
            return response()->json([
                'message' => 'Không tìm thấy lịch trình hoặc lịch trình không thuộc Tour này.'
            ], 404);
        }

        $schedule->delete();

        return response()->json([
            'message' => 'Xóa lịch trình thành công!'
        ]);
    }
}