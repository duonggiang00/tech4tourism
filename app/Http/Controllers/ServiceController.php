<?php

namespace App\Http\Controllers;

use App\Models\Services;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Provider;
use App\Models\Service;
use App\Models\ServiceType;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Request as FacadesRequest;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Service::with(['provider:id,name', 'serviceType:id,name'])
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $service_types = ServiceType::select('id', 'name')->get();
        $providers = Provider::select('id', 'name')->get();

        return Inertia::render('Services/index', [
            'services' => $services,
            'service_types' => $service_types,
            'providers' => $providers,
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create() {}


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request)
    {
        $data = $request->validated();
        $service = Service::create($data);

        if ($request->query('from') === 'provider') {
            return back()->with('message', 'Thêm dịch vụ thành công!');
        }
        return redirect()->route('services.index')
            ->with('message', 'Thêm dịch vụ thành công!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        $service->load([
            'provider',
            'serviceType',
            'tourServices.tour', // phải có quan hệ trong model mới chạy được
        ]);

        return Inertia::render('Services/show', [
            'service' => $service,
            'serviceTypes' => ServiceType::select('id', 'name')->get(),
            'providers' => Provider::select('id', 'name')->get(),
        ]);
    }


    public function update(UpdateServiceRequest $request, Service $service)
    {
        $service->update($request->validated());

        if ($request->query('from') === 'provider') {
            return back()->with('message', 'Cập nhật dịch vụ thành công!');
        }
        return redirect()->route('services.index')
            ->with('message', 'Cập nhật dịch vụ thành công!');
    }

    public function destroy(Service $service, HttpRequest $request)
    {
        $service->delete();

        if ($request->query('from') === 'provider') {
            return back()->with('message', 'Xóa dịch vụ thành công!');
        }

        return redirect()->route('services.index')
            ->with('message', 'Xóa dịch vụ thành công!');
    }
}
