<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourImagesRequest;
use App\Models\Tour;
use App\Models\TourImages;
use Illuminate\Http\Request; // Vẫn giữ Request cho update/destroy nếu cần, nhưng store dùng StoreTourImagesRequest
use Illuminate\Support\Facades\Storage;

class TourImagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($tourId)
    {
        $images = TourImages::where('tour_id', $tourId)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json($images);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTourImagesRequest $request, $tourId)
    {
        // Dữ liệu đã được validate tự động bởi StoreTourImagesRequest
        // Không cần gọi $request->validate() ở đây nữa.

        $uploadedImages = [];

        if ($request->hasFile('images')) {
            $files = $request->file('images');

            foreach ($files as $file) {
                // 1. Lưu file vào storage
                $path = $file->store('tour_gallery', 'public');

                // 2. Tạo bản ghi cho từng ảnh
                $uploadedImages[] = TourImages::create([
                    'tour_id' => $tourId,
                    'img_url' => $path,
                    // Lấy tên file gốc làm alt text mặc định
                    'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'order' => 0,
                ]);
            }
        }

        return redirect()->back()->with('message', 'Đã thêm ' . count($uploadedImages) . ' hình ảnh thành công!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tour $tour, TourImages $image)
    {
        // 1. Kiểm tra sở hữu
        if ($image->tour_id !== $tour->id) {
            return response()->json(['message' => 'Ảnh không thuộc về tour này.'], 403);
        }

        try {
            // 2. Xóa file vật lý
            if ($image->img_url && Storage::disk('public')->exists($image->img_url)) {
                Storage::disk('public')->delete($image->img_url);
            }

            // 3. Xóa DB record
            $image->delete();

            return response()->json([
                'message' => 'Xóa ảnh thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xóa ảnh',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}