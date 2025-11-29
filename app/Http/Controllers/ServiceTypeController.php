<?php

namespace App\Http\Controllers;


use App\Http\Requests\StoreService_typesRequest;
use App\Http\Requests\StoreServiceTypeRequest;
use App\Http\Requests\UpdateService_typesRequest;
use App\Http\Requests\UpdateServiceTypeRequest;
use App\Models\ServiceType;
use App\Models\ServiceTypes;
use Inertia\Inertia;

class ServiceTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $service_types = ServiceType::all();
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
    public function store(StoreServiceTypeRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('iconFile')) {
            $path = $request->file('iconFile')->store('icons', 'public');
            $data['icon'] = $path;
        }

        $serviceType = ServiceType::create($data);

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Tạo loại dịch vụ mới thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceType $service_types)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceType $service_types)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceTypeRequest $request, ServiceType $service_type)
    {
        $data = $request->validated();
        $service_type->update($data);

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Cập nhật loại dịch vụ thành công!');
    }

    public function destroy(ServiceType $service_type)
    {
        $service_type->delete();

        return redirect()
            ->route('service-types.index')
            ->with('message', 'Đã xóa loại dịch vụ thành công!');
    }
}
