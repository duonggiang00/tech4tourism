<?php

namespace App\Http\Controllers;

use App\Models\ServiceAttribute;
use App\Models\Service;
use App\Http\Requests\StoreServiceAttributesRequest;
use App\Http\Requests\UpdateServiceAttributesRequest;
use Inertia\Inertia;

class ServiceAttributesController extends Controller
{
    /**
     * Hiển thị danh sách các thuộc tính dịch vụ.
     */
    public function index()
    {
        $attributes = ServiceAttribute::with('service:id,name')->get();
        $services = Service::select('id', 'name')->get();
        // dd($attributes);

        return Inertia::render('ServiceAttributes/index', compact('attributes', 'services'));
    }

    /**
     * Thêm mới thuộc tính dịch vụ.
     */
    public function store(StoreServiceAttributesRequest $request)
    {
        ServiceAttribute::create($request->validated());

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Thêm thuộc tính dịch vụ thành công!');
    }

    /**
     * Cập nhật thuộc tính dịch vụ.
     */
    public function update(UpdateServiceAttributesRequest $request, ServiceAttribute $serviceAttribute)
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