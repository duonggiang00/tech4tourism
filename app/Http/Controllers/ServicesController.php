<?php

namespace App\Http\Controllers;

use App\Models\Services;
use App\Http\Requests\StoreServicesRequest;
use App\Http\Requests\UpdateServicesRequest;
use App\Models\Providers;
use App\Models\ServiceTypes;
use Inertia\Inertia;

class ServicesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Services::all();
        $service_types = ServiceTypes::all();
        $providers = Providers::all();
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
    public function store(StoreServicesRequest $request)
    {
        Services::create($request->validated());

        return redirect()->route('services.index')
            ->with('message', 'Thêm dịch vụ mới thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Services $services)
    {
        //
    }
    public function update(UpdateServicesRequest $request, Services $service)
    {
        $service->update($request->validated());

        return redirect()
            ->route('services.index')
            ->with('message', 'Cập nhật dịch vụ thành công!');
    }

    public function destroy(Services $service)
    {
        $service->delete();

        return redirect()
            ->route('services.index')
            ->with('message', 'Xóa dịch vụ thành công!');
    }
}
