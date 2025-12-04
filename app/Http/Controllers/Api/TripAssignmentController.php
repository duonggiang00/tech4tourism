<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TripAssignment;
use App\Models\Notification;
use App\Models\Tour;
use App\Http\Requests\StoreTripAssignmentRequest;
use App\Http\Requests\UpdateTripAssignmentRequest;
use Illuminate\Http\Request;

class TripAssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     * (Thường dùng nếu bạn muốn lấy danh sách guide qua API riêng lẻ)
     */
    public function index($tourId)
    {
        $assignments = TripAssignment::with('user')
            ->where('tour_id', $tourId)
            ->get();

        return response()->json($assignments);
    }

    /**
     * Store a newly created resource in storage.
     * Logic: Thêm hướng dẫn viên vào Tour
     */
    public function store(StoreTripAssignmentRequest $request, $tourId)
    {
        // 1. Kiểm tra xem User này đã có trong Tour chưa (Tránh duplicate)
        // Dù validation có thể làm, nhưng check ở đây để chắc chắn logic
        $exists = TripAssignment::where('tour_id', $tourId)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Nhân viên này đã được phân công vào tour rồi.'
            ], 422);
        }

        // 2. Tạo mới Assignment
        $assignment = TripAssignment::create([
            'tour_id' => $tourId,
            'user_id' => $request->user_id,
            'status' => $request->status ?? '0', // Mặc định là '0' (Chờ)
        ]);

        // 3. Load thông tin Tour và User
        $assignment->load(['tour', 'user']);

        // 4. Tạo thông báo cho HDV
        Notification::create([
            'user_id' => $request->user_id,
            'type' => 'tour_assigned',
            'title' => 'Bạn được phân công tour mới',
            'message' => "Bạn đã được phân công tour: {$assignment->tour->title}",
            'data' => [
                'tour_id' => $tourId,
                'tour_title' => $assignment->tour->title,
                'assignment_id' => $assignment->id,
            ],
        ]);

        return response()->json([
            'message' => 'Thêm hướng dẫn viên thành công!',
            'data' => $assignment
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     * Logic: Cập nhật trạng thái (VD: Chờ -> Đã nhận)
     */
    public function update(UpdateTripAssignmentRequest $request, $tourId, $assignmentId)
    {
        // Tìm bản ghi dựa trên ID và TourID để bảo mật
        $assignment = TripAssignment::where('id', $assignmentId)
            ->where('tour_id', $tourId)
            ->firstOrFail();

        $assignment->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!',
            'data' => $assignment
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * Logic: Xóa hướng dẫn viên khỏi Tour
     */
    public function destroy($tourId, $assignmentId)
    {
        $assignment = TripAssignment::where('id', $assignmentId)
            ->where('tour_id', $tourId)
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Không tìm thấy dữ liệu phân công.'], 404);
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Đã xóa hướng dẫn viên khỏi tour.'
        ]);
    }
}