<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Service;
use App\Models\ServiceAttribute;
use App\Http\Requests\StoreServiceAttributeRequest;
use App\Http\Requests\StoreServiceAttributesRequest;
use App\Http\Requests\UpdateServiceAttributeRequest;
use App\Http\Requests\UpdateServiceAttributesRequest;
use Illuminate\Http\Request;

class ServiceAttributesController extends Controller
{
    /**
     * Hiển thị danh sách các thuộc tính dịch vụ.
     */
    public function index(Request $request)
    {
        $query = ServiceAttribute::query()->with(['service:id,name']);

        // 🔍 Tìm kiếm theo tên, giá trị, loại, hoặc tên dịch vụ
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('value', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhereHas('service', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 📊 Lọc theo tên dịch vụ cụ thể
        if ($serviceName = $request->input('service_name')) {
            $query->whereHas('service', function ($q) use ($serviceName) {
                $q->where('name', $serviceName);
            });
        }

        $attributes = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Lấy danh sách tên dịch vụ duy nhất cho bộ lọc
        $serviceNames = Service::distinct()->orderBy('name')->pluck('name');

        // Lấy danh sách dịch vụ đầy đủ cho dialog thêm/sửa
        $services = Service::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('ServiceAttributes/index', [
            'attributes' => $attributes,
            'services' => $services,
            'service_names' => $serviceNames,
            'filters' => $request->only(['search', 'service_name']),
        ]);
    }

    /**
     * Thêm mới thuộc tính dịch vụ.
     */
    public function store(StoreServiceAttributeRequest $request)
    {
        ServiceAttribute::create($request->validated());

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Thêm thuộc tính dịch vụ thành công!');
    }

    /**
     * Cập nhật thuộc tính dịch vụ.
     */
    public function update(UpdateServiceAttributeRequest $request, ServiceAttribute $serviceAttribute)
    {
        $serviceAttribute->update($request->validated());

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Cập nhật thuộc tính dịch vụ thành công!');
    }

    /**
     * Xóa thuộc tính dịch vụ.
     */
    public function destroy(ServiceAttribute $serviceAttribute)
    {
        $serviceAttribute->delete();

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Xóa thuộc tính dịch vụ thành công!');
    }

    /**
     * Hiển thị chi tiết thuộc tính dịch vụ.
     */
    public function show(ServiceAttribute $serviceAttribute)
    {
        $serviceAttribute->load('service');

        return Inertia::render('ServiceAttributes/Show', [
            'attribute' => $serviceAttribute,
        ]);
    }
}
