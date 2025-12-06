<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceAttributeRequest;
use App\Models\ServiceAttribute;
use App\Models\Service;
use App\Http\Requests\StoreServiceAttributesRequest;
use App\Http\Requests\UpdateServiceAttributeRequest;
use App\Http\Requests\UpdateServiceAttributesRequest;
use Inertia\Inertia;

class ServiceAttributesController extends Controller
{
    /**
     * Hiển thị danh sách các thuộc tính dịch vụ.
     */
    public function index()
    {
        $attributes = ServiceAttribute::with('service')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $services = Service::select('id', 'name')->get();

        return Inertia::render('ServiceAttributes/index', [
            'attributes' => $attributes,
            'services'   => $services,
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
    public function edit(ServiceAttribute $service_attribute)
    {
        return Inertia::render('ServiceAttributes/edit', [
            'attribute' => $service_attribute->load('service'),
            'services' => Service::all(['id', 'name']),
        ]);
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

        return Inertia::render('ServiceAttributes/show', [
            'attribute' => $serviceAttribute,
        ]);
    }
}
