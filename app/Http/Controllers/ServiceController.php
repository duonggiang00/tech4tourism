<?php

namespace App\Http\Controllers;

use App\Models\Services;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Provider;
use App\Models\Service;
use App\Models\ServiceType;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Service::all();
        $service_types = ServiceType::all();
        $providers = Provider::all();
        // dd($services);
        return Inertia::render('Services/index', compact('services', 'service_types', 'providers'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request)
    {
        Service::create($request->validated());

        return redirect()->route('services.index')
            ->with('message', 'Thêm dịch vụ mới thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $services)
    {
        //
    }
    public function update(UpdateServiceRequest $request, Service $service)
    {
        $service->update($request->validated());

        return redirect()
            ->route('services.index')
            ->with('message', 'Cập nhật dịch vụ thành công!');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()
            ->route('services.index')
            ->with('message', 'Xóa dịch vụ thành công!');
    }
}
