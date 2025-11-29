<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourPolicy;
use App\Http\Requests\StoreTourPolicyRequest;
use App\Http\Requests\UpdateTourPolicyRequest;
use Illuminate\Http\Request;

class TourPolicyController extends Controller
{
    /**
     * Lấy danh sách chính sách của một Tour
     * GET /api/tours/{tourId}/policies
     */
    public function index($tourId)
    {
        $tourPolicies = TourPolicy::with('policy')
            ->where('tour_id', $tourId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tourPolicies);
    }

    /**
     * Thêm mới chính sách vào Tour
     * POST /api/tours/{tourId}/policies
     */
    public function store(StoreTourPolicyRequest $request, $tourId)
    {
        // Dữ liệu đã được validate trong StoreTourPolicyRequest

        // Kiểm tra xem chính sách này đã được thêm vào tour chưa (tránh trùng lặp)
        $exists = TourPolicy::where('tour_id', $tourId)
            ->where('policy_id', $request->policy_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Chính sách này đã tồn tại trong tour.'], 409);
        }

        // Tạo bản ghi mới
        $tourPolicy = TourPolicy::create([
            'tour_id' => $tourId,
            'policy_id' => $request->policy_id,
        ]);

        // Load quan hệ để trả về frontend hiển thị tên chính sách ngay
        $tourPolicy->load('policy');

        return response()->json([
            'message' => 'Thêm chính sách thành công',
            'data' => $tourPolicy
        ], 201);
    }

    /**
     * Xem chi tiết một TourPolicy
     * GET /api/tours/{tourId}/policies/{id}
     */
    public function show($tourId, TourPolicy $tourPolicy)
    {
        return response()->json($tourPolicy->load('policy'));
    }

    /**
     * Cập nhật TourPolicy (thường là sửa nội dung override)
     * PUT /api/tours/{tourId}/policies/{id}
     */
    public function update(UpdateTourPolicyRequest $request, $tourId, TourPolicy $tourPolicy)
    {
        // Kiểm tra xem item này có thuộc về tour hiện tại không
        if ($tourPolicy->tour_id != $tourId) {
            return response()->json(['message' => 'Chính sách không thuộc về tour này.'], 403);
        }

        // Dữ liệu đã được validate trong UpdateTourPolicyRequest
        $tourPolicy->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật chính sách thành công',
            'data' => $tourPolicy->load('policy')
        ]);
    }

    /**
     * Xóa chính sách khỏi Tour
     * DELETE /api/tours/{tourId}/policies/{id}
     */
    public function destroy($tourId, $tourPolicy)
    {
        $tourPolicy = TourPolicy::where('id', $tourPolicy)
            ->where('tour_id', $tourId)
            ->first();

        if (!$tourPolicy) {
            return response()->json([
                'message' => 'Không tìm thấy lịch trình hoặc lịch trình không thuộc Tour này.'
            ], 404);
        }

        $tourPolicy->delete();

        return response()->json([
            'message' => 'Xóa chính sách khỏi tour thành công'
        ], 200);
    }
}