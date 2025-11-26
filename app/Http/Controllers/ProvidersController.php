<?php

namespace App\Http\Controllers;

use App\Models\Providers;
use App\Http\Requests\StoreProvidersRequest;
use App\Http\Requests\UpdateProvidersRequest;
use Inertia\Inertia;

class ProvidersController extends Controller
{
    /**
     * Hiển thị danh sách nhà cung cấp.
     */
    public function index()
    {
        $providers = Providers::all();
        // dd($providers);
        return Inertia::render('Providers/index', compact('providers'));
    }

    /**
     * Lưu nhà cung cấp mới.
     */
    public function store(StoreProvidersRequest $request)
    {
        Providers::create($request->validated());

        return redirect()
            ->route('providers.index')
            ->with('message', 'Thêm nhà cung cấp mới thành công!');
    }

    /**
     * Hiển thị chi tiết nhà cung cấp.
     */
    public function show(Providers $provider)
    {
        return Inertia::render('Providers/show', [
            'provider' => $provider,
        ]);
    }

    /**
     * Cập nhật thông tin nhà cung cấp.
     */
    public function update(UpdateProvidersRequest $request, Providers $provider)
    {
        $provider->update($request->validated());

        return redirect()
            ->route('providers.index')
            ->with('message', 'Cập nhật nhà cung cấp thành công!');
    }

    /**
     * Xóa nhà cung cấp.
     */
    public function destroy(Providers $provider)
    {
        $provider->delete();

        return redirect()
            ->route('providers.index')
            ->with('message', 'Xóa nhà cung cấp thành công!');
    }
}
