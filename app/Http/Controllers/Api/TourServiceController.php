<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourService;
use App\Http\Requests\StoreTourServiceRequest;
use App\Http\Requests\UpdateTourServiceRequest;
use Illuminate\Http\Request;

class TourServiceController extends Controller
{
    /**
     * Lấy danh sách dịch vụ của một Tour cụ thể
     * GET /tours/{tourId}/tourservices
     */
    // Lưu ý: Phải nhận tham số $tourId từ route prefix
    public function index($tourId)
    {
        $services = TourService::with(['service.serviceType'])
            ->where('tour_id', $tourId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($services);
    }

    /**
     * Thêm mới dịch vụ vào Tour
     * POST /tours/{tourId}/tourservices
     */
    // SỬA LỖI 500 Ở ĐÂY: Thêm tham số $tour vào hàm store
    public function store(StoreTourServiceRequest $request, $tour)
    {
        $data = $request->validated();

        // Xử lý Route Model Binding:
        // Nếu Laravel tự bind model Tour thì lấy id, nếu không thì lấy trực tiếp giá trị
        $tourId = ($tour instanceof \App\Models\Tour) ? $tour->id : $tour;

        // 1. Gán tour_id (Đây là bước bị thiếu gây lỗi 500 trước đó)
        $data['tour_id'] = $tourId;

        // 2. Tính toán lại tổng tiền
        $data['price_total'] = $data['quantity'] * $data['price_unit'];

        // 3. Tạo bản ghi
        $tourService = TourService::create($data);

        // 4. Load quan hệ service để trả về frontend hiển thị
        $tourService->load('service');

        return response()->json([
            'message' => 'Thêm dịch vụ thành công',
            'data' => $tourService
        ], 201);
    }

    /**
     * Display the specified resource.
     * GET /tours/{tourId}/tourservices/{id}
     */
    public function show($tourId, TourService $tourservice)
    {
        return response()->json($tourservice->load('service'));
    }

    /**
     * Cập nhật dịch vụ trong Tour
     * PUT /tours/{tourId}/tourservices/{id}
     */
    // Lưu ý: Route nested sẽ truyền cả $tour và $tourservice
    public function update(UpdateTourServiceRequest $request, $tour, TourService $tourservice)
    {
        $tourId = ($tour instanceof \App\Models\Tour) ? $tour->id : $tour;

        // Kiểm tra an toàn: Dịch vụ phải thuộc về tour này
        if ($tourservice->tour_id != $tourId) {
            return response()->json(['message' => 'Dịch vụ không thuộc về tour này.'], 403);
        }

        $data = $request->validated();

        // Tính toán lại tổng tiền
        if (isset($data['quantity']) && isset($data['price_unit'])) {
            $data['price_total'] = $data['quantity'] * $data['price_unit'];
        }

        $tourservice->update($data);

        return response()->json([
            'message' => 'Cập nhật dịch vụ thành công',
            'data' => $tourservice->load('service')
        ]);
    }

    /**
     * Xóa dịch vụ khỏi Tour
     * DELETE /tours/{tourId}/tourservices/{id}
     */
    public function destroy($tour, TourService $tourservice)
    {
        $tourId = ($tour instanceof \App\Models\Tour) ? $tour->id : $tour;

        // Kiểm tra quyền sở hữu
        if ($tourservice->tour_id != $tourId) {
            return response()->json(['message' => 'Dịch vụ không thuộc về tour này.'], 403);
        }

        $tourservice->delete();

        return response()->json([
            'message' => 'Xóa dịch vụ thành công'
        ], 200);
    }
}