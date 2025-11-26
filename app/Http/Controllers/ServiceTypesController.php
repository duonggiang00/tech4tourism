<?php

namespace App\Http\Controllers;

use App\Models\Service_types;
use App\Http\Requests\StoreService_typesRequest;
use App\Http\Requests\UpdateService_typesRequest;
use App\Models\ServiceTypes;
use Inertia\Inertia;

class ServiceTypesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $service_types = ServiceTypes::all();
        // dd($service_types);
        return Inertia::render('service_types/index', compact('service_types'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('service_types/create', []);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreService_typesRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('iconFile')) {
            $path = $request->file('iconFile')->store('icons', 'public');
            $data['icon'] = $path;
        }

        $serviceType = ServiceTypes::create($data);

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Tạo loại dịch vụ mới thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceTypes $service_types)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceTypes $service_types)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateService_typesRequest $request, ServiceTypes $service_type)
    {
        $data = $request->validated();
        $service_type->update($data);

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Cập nhật loại dịch vụ thành công!');
    }

    public function destroy(ServiceTypes $service_type)
    {
        $service_type->delete();

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Đã xóa loại dịch vụ thành công!');
    }
}
