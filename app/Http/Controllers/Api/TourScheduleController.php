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
        // Sắp xếp theo 'date' tăng dần (asc)
        $schedules = TourSchedule::where('tour_id', $tourId)
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    // app/Http/Controllers/Api/TourScheduleController.php

    public function store(StoreTourScheduleRequest $request, $tourId) // <--- Thêm $tourId vào tham số
    {
        // 1. Lấy dữ liệu đã validate (lúc này chưa có tour_id)
        $data = $request->validated();

        // 2. Gán tour_id lấy từ URL vào mảng dữ liệu
        $data['tour_id'] = $tourId;

        // 3. Tạo mới
        $schedule = TourSchedule::create($data);

        return response()->json([
            'message' => 'Thêm lịch trình thành công!',
            'data' => $schedule,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TourSchedule $tourSchedule)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTourScheduleRequest $request, TourSchedule $tourSchedule)
    {
        $tourSchedule->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật lịch trình thành công!',
            'data' => $tourSchedule,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TourSchedule $tourSchedule)
    {
        $tourSchedule->delete();

        return response()->json([
            'message' => 'Xóa lịch trình thành công!'
        ]);
    }
}
