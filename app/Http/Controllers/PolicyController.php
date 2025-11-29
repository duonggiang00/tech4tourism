<?php

namespace App\Http\Controllers;

use App\Models\Policy;
use App\Http\Requests\StorePolicyRequest;
use App\Http\Requests\UpdatePolicyRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class PolicyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Lấy danh sách policy, sắp xếp mới nhất lên đầu
        $policies = Policy::latest()->get();

        // Trả về view React 'Policies/index' kèm dữ liệu
        return Inertia::render('Policies/index', compact('policies'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Policies/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePolicyRequest $request)
    {
        // Dữ liệu đã được validate trong StorePolicyRequest
        Policy::create($request->validated());

        return redirect()->route('policies.index')->with('message', 'Thêm chính sách thành công');
    }

    /**
     * Display the specified resource.
     */
    public function show(Policy $policy)
    {
        // Thường admin ít dùng trang show riêng, nhưng nếu cần thì đây:
        return Inertia::render('Policies/show', compact('policy'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Policy $policy)
    {
        return Inertia::render('Policies/edit', compact('policy'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePolicyRequest $request, Policy $policy)
    {
        // Cập nhật dữ liệu đã validate
        $policy->update($request->validated());

        return redirect()->back()->with('message', 'Cập nhật chính sách thành công');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Policy $policy)
    {
        $policy->delete();

        return redirect()->back()->with('message', 'Xóa chính sách thành công');
    }
}