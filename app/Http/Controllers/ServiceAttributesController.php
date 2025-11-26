<?php

namespace App\Http\Controllers;

use App\Models\ServiceAttributes;
use App\Models\Services;
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
        $attributes = ServiceAttributes::with('service:id,name')->get();
        $services = Services::select('id', 'name')->get();
        // dd($attributes);

        return Inertia::render('ServiceAttributes/index', compact('attributes', 'services'));
    }

    /**
     * Thêm mới thuộc tính dịch vụ.
     */
    public function store(StoreServiceAttributesRequest $request)
    {
        ServiceAttributes::create($request->validated());

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Thêm thuộc tính dịch vụ thành công!');
    }

    /**
     * Cập nhật thuộc tính dịch vụ.
     */
    public function update(UpdateServiceAttributesRequest $request, ServiceAttributes $serviceAttribute)
    {
        $serviceAttribute->update($request->validated());

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Cập nhật thuộc tính dịch vụ thành công!');
    }

    /**
     * Xóa thuộc tính dịch vụ.
     */
    public function destroy(ServiceAttributes $serviceAttribute)
    {
        $serviceAttribute->delete();

        return redirect()
            ->route('service-attributes.index')
            ->with('message', 'Xóa thuộc tính dịch vụ thành công!');
    }

    /**
     * Hiển thị chi tiết thuộc tính dịch vụ.
     */
    public function show(ServiceAttributes $serviceAttribute)
    {
        $serviceAttribute->load('service');

        return Inertia::render('ServiceAttributes/Show', [
            'attribute' => $serviceAttribute,
        ]);
    }
}