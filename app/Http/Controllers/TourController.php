<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tour;
use App\Http\Requests\StoreTourRequest;
use App\Http\Requests\UpdateTourRequest;
use App\Models\Policy;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TourController extends Controller
{
    public function index()
    {
        $tours = Tour::all();
        $categories = Category::latest()->get();;
        return Inertia::render('Tours/index', compact('tours', 'categories'));
    }

    public function store(StoreTourRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('tours', 'public');
            $data['thumbnail'] = $path;
        }

        $tour = Tour::create($data);

        return redirect()->route('tours.show', $tour)->with('message', 'Tạo tour mới thành công!');
    }

    public function show(Tour $tour)
    {
        $availablePolicies = Policy::all();
        $categories = Category::all();
        $availableServices = Service::all();
        $tour->load([
            'images',
            'schedules',
            'tourServices.service.serviceType',
            'tourPolicies.policy'
        ]);
        return Inertia::render('Tours/detail', compact('tour', 'categories','availableServices','availablePolicies'));
    }

    public function update(UpdateTourRequest $request, Tour $tour)
    {
        $data = $request->validated();

        // Kiểm tra xem người dùng có upload ảnh mới không
        if ($request->hasFile('thumbnail')) {

            // 1. Lấy đường dẫn gốc từ DB (bỏ qua Accessor url đầy đủ)
            $oldThumbnail = $tour->getRawOriginal('thumbnail');

            // 2. Kiểm tra và xóa ảnh cũ trên đĩa
            if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                Storage::disk('public')->delete($oldThumbnail);
            }

            // 3. Lưu ảnh mới và cập nhật đường dẫn
            $path = $request->file('thumbnail')->store('tours', 'public');
            $data['thumbnail'] = $path;
        } else {
            // Nếu không có ảnh mới, loại bỏ key thumbnail để không ghi đè null vào DB
            unset($data['thumbnail']);
        }

        $tour->update($data);

        return redirect()->back()->with('message', 'Cập nhật tour thành công!');
    }

    public function destroy(Tour $tour)
    {
        // 1. Lấy đường dẫn gốc từ DB
        $thumbnail = $tour->getRawOriginal('thumbnail');

        // 2. Xóa ảnh vật lý trước
        if ($thumbnail && Storage::disk('public')->exists($thumbnail)) {
            Storage::disk('public')->delete($thumbnail);
        }

        // 3. Xóa record trong DB
        $tour->delete();

        return redirect()->route('tours.index')->with('message', 'Xóa tour thành công!');
    }
}