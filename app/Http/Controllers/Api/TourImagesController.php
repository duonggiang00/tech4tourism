<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourImagesRequest;
use App\Models\TourImages;
use Illuminate\Http\Request;

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
    public function destroy(TourImages $tourImages)
    {
        //
    }
}
