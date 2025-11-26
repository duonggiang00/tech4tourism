<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourImagesRequest;
use App\Models\Tour;
use App\Models\TourImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TourImagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($tourId)
    {
        // Sắp xếp theo order để hiển thị đúng thứ tự
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
        // 1. Lấy dữ liệu đã validate
        $data = $request->validated();

        // 2. Xử lý upload file
        if ($request->hasFile('image')) {
            // Lưu vào thư mục 'public/tour_gallery'
            $path = $request->file('image')->store('tour_gallery', 'public');

            // Gán đường dẫn vào key 'img_url' để khớp với Database
            $data['img_url'] = $path;
        }

        // 3. Gán tour_id lấy từ URL
        $data['tour_id'] = $tourId;

        // 4. Tạo bản ghi trong DB
        $tourImage = TourImages::create($data);


        return redirect()->back()->with('message', 'Thêm hình ảnh tour thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(TourImages $tourImages)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TourImages $tourImages)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tour $tour, TourImages $image)
    {
        // 1. (Tuỳ chọn) Kiểm tra xem ảnh này có thuộc về Tour đó không để bảo mật
        if ($image->tour_id !== $tour->id) {
            return response()->json(['message' => 'Ảnh không thuộc về tour này.'], 403);
        }

        try {
            // 2. Xóa file ảnh vật lý trong thư mục storage (nếu tồn tại)
            // Giả sử bạn lưu trong disk 'public' và đường dẫn trong DB là 'tours/filename.jpg'
            if ($image->img_url && Storage::disk('public')->exists($image->img_url)) {
                Storage::disk('public')->delete($image->img_url);
            }

            // 3. Xóa bản ghi trong database
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
