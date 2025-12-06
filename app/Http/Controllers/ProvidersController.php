<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProviderRequest;
use App\Http\Requests\UpdateProviderRequest;
use App\Models\Provider;
use App\Http\Requests\StoreProvidersRequest;
use App\Http\Requests\UpdateProvidersRequest;
use App\Models\Province;
use App\Models\ServiceType;
use Inertia\Inertia;

class ProvidersController extends Controller
{
    /**
     * Hiển thị danh sách nhà cung cấp.
     */
    public function index()
    {
        $providers = Provider::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Providers/index', [
            'providers' => $providers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Providers/form', [
            'serviceTypes' => \App\Models\ServiceType::all(['id', 'name']),
            'provinces' => \App\Models\Province::all(['id', 'name']),
        ]);
    }



    /**
     * Lưu nhà cung cấp mới.
     */
    public function store(StoreProviderRequest $request)
    {

        $provider = Provider::create($request->validated());

        if ($request->has('services')) {
            foreach ($request->services as $service) {
                $provider->services()->create([
                    'name' => $service['name'],
                    'description' => $service['description'] ?? null,
                    'unit' => $service['unit'] ?? null,
                    'service_type_id' => $service['service_type_id'] ?? null,
                ]);
            }
        }

        return redirect()->route('providers.index')
            ->with('message', 'Tạo nhà cung cấp & dịch vụ thành công!');
    }


    /**
     * Hiển thị chi tiết nhà cung cấp.
     */
    public function show(Provider $provider)
    {
        $provider->load([
            'province',
            'services',   // đã tự load serviceType + serviceAttributes
        ]);

        return Inertia::render('Providers/show', [
            'provider' => $provider,
            'provinces' => Province::select('id', 'name')->get(),
            'serviceTypes' => ServiceType::select('id', 'name')->get(), // danh sách loại dịch vụ
        ]);
    }

    public function edit(Provider $provider)
    {
        $provider->load([
            'services.serviceType'
        ]);

        return Inertia::render('Providers/form', [
            'provider' => $provider,
            'serviceTypes' => ServiceType::select('id', 'name')->get(),
            'provinces' => Province::select('id', 'name')->get(),
        ]);
    }



    /**
     * Cập nhật thông tin nhà cung cấp.
     */
    public function update(UpdateProviderRequest $request, Provider $provider)
    {
        $provider->update($request->validated());

        return redirect()
            ->route('providers.index')
            ->with('message', 'Cập nhật nhà cung cấp thành công!');
    }

    /**
     * Xóa nhà cung cấp.
     */
    public function destroy(Provider $provider)
    {
        $provider->delete();

        return redirect()
            ->route('providers.index')
            ->with('message', 'Xóa nhà cung cấp thành công!');
    }
}
