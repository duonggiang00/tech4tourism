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
        $search = request('search');
        $providerId = request('provider_id');
        $serviceTypeId = request('service_type_id');

        $query = Service::query()
            ->with(['provider:id,name', 'serviceType:id,name'])
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($providerId, fn($q) => $q->where('provider_id', $providerId))
            ->when($serviceTypeId, fn($q) => $q->where('service_type_id', $serviceTypeId))
            ->orderBy('id', 'desc');

        $services = $query->paginate(10)->withQueryString();

        $service_types = ServiceType::select('id', 'name')->get();
        $providers = Provider::select('id', 'name')->get();

        return Inertia::render('Services/index', [
            'services' => $services,
            'service_types' => $service_types,
            'providers' => $providers,
            'filters' => [
                'search' => $search,
                'provider_id' => $providerId,
                'service_type_id' => $serviceTypeId,
            ],
        ]);
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
