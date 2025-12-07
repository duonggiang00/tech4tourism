<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use App\Http\Requests\StoreProviderRequest;
use App\Http\Requests\UpdateProviderRequest;
use Inertia\Inertia;

class ProvidersController extends Controller
{
    /**
     * Hiển thị danh sách nhà cung cấp.
     */
    public function index()
    {
        $providers = Provider::with('services')->get();
        $serviceTypes = \App\Models\ServiceType::all();
        return Inertia::render('Providers/index', compact('providers', 'serviceTypes'));
    }

    /**
     * Lưu nhà cung cấp mới.
     */
    public function store(StoreProviderRequest $request)
    {
        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $providerData = $request->validated();
            $provider = Provider::create($providerData);

            if ($request->has('services')) {
                foreach ($request->all()['services'] as $serviceData) {
                    // Validation: Check if service name already exists for ANOTHER provider
                    $exists = \App\Models\Service::where('name', $serviceData['name'])
                        ->where('provider_id', '!=', $provider->id)
                        ->exists();

                    if ($exists) {
                        // Find who has it
                        $other = \App\Models\Service::where('name', $serviceData['name'])->first();
                        $otherProvider = $other ? $other->provider->name : 'Unknown';

                        throw new \Exception("Dịch vụ '{$serviceData['name']}' đã được cung cấp bởi '{$otherProvider}'");
                    }

                    $provider->services()->create([
                        'name' => $serviceData['name'],
                        'service_type_id' => $serviceData['service_type_id'],
                        'price' => $serviceData['price'] ?? 0,
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return redirect()
                ->route('providers.index')
                ->with('message', 'Thêm nhà cung cấp và dịch vụ thành công!');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Hiển thị chi tiết nhà cung cấp.
     */
    public function show(Provider $provider)
    {
        $provider->load(['services.serviceType']);
        return Inertia::render('Providers/show', [
            'provider' => $provider,
        ]);
    }

    /**
     * Cập nhật thông tin nhà cung cấp.
     */
    public function update(UpdateProviderRequest $request, Provider $provider)
    {
        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $provider->update($request->validated());

            if ($request->has('services')) {
                // For simplicity in this refactor: Delete all old services and recreate (or we could sync smart)
                // However, preserving IDs is better for related data.
                // Let's implement a "Delete missing, Update existing, Create new" strategy if IDs are present.
                // But simplifying to "Delete All -> Create All" is risky if TourServices rely on Service IDs.
                // Given the prompt didn't specify editing services logic deeply, but "Adding services" was key.
                // Let's assume we can add new ones. Editing existing structure might be complex.
                // For now, I'll Delete and Recreate ensuring validation.
                // CAUTION: This changes Service IDs. If other tables link to ServiceID, this breaks relations.
                // Let's check Service links: `TourService`.

                // SAFE APPROACH: Iterate and update/create.
                $submittedServices = $request->all()['services'];
                $submittedIds = array_column(array_filter($submittedServices, function ($s) {
                    return isset($s['id']);
                }), 'id');

                // Delete services not in submitted list
                $provider->services()->whereNotIn('id', $submittedIds)->delete();

                foreach ($submittedServices as $serviceData) {
                    // Validation
                    $exists = \App\Models\Service::where('name', $serviceData['name'])
                        ->where('provider_id', '!=', $provider->id)
                        ->exists();

                    if ($exists) {
                        $other = \App\Models\Service::where('name', $serviceData['name'])->first();
                        $otherProvider = $other ? $other->provider->name : 'Unknown';
                        throw new \Exception("Dịch vụ '{$serviceData['name']}' đã được cung cấp bởi '{$otherProvider}'");
                    }

                    if (isset($serviceData['id'])) {
                        // Update
                        $service = \App\Models\Service::find($serviceData['id']);
                        if ($service && $service->provider_id == $provider->id) {
                            $service->update([
                                'name' => $serviceData['name'],
                                'service_type_id' => $serviceData['service_type_id'],
                                'price' => $serviceData['price'] ?? 0,
                            ]);
                        }
                    } else {
                        // Create
                        $provider->services()->create([
                            'name' => $serviceData['name'],
                            'service_type_id' => $serviceData['service_type_id'],
                            'price' => $serviceData['price'] ?? 0,
                        ]);
                    }
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return redirect()
                ->route('providers.index')
                ->with('message', 'Cập nhật nhà cung cấp thành công!');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
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
