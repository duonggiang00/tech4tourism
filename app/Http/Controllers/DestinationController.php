<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Province;
use App\Models\Country;
use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use Inertia\Inertia;

class DestinationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Sử dụng Eager Loading để lấy quan hệ province và country của province đó
        // Cú pháp 'province.country' nghĩa là: lấy province, sau đó lấy country thuộc province đó
        $destinations = Destination::with(['province.country'])->get();

        return Inertia::render("Destinations/index", compact("destinations"));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $countries = Country::all();
        $provinces = Province::all();

        return Inertia::render("Destinations/create", [
            "countries" => $countries,
            "provinces" => $provinces, 
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDestinationRequest $request)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "province_id" => "required|exists:provinces,id", // Nên validate id có tồn tại không
            "address" => "required|string",
            "status" => "required",
            "description" => "nullable|string", // Description có thể null
        ]);

        Destination::create($request->all());
        
        return redirect()->route("destination.index")->with("message", "Thêm mới thành công!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Destination $destination)
    {
        // Load relationship nếu muốn xem chi tiết
        $destination->load(['province.country']);
        return Inertia::render("Destinations/show", compact("destination"));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Destination $destination)
    {
        // Cần lấy danh sách quốc gia và tỉnh để hiển thị trong select box khi edit
        $countries = Country::all();
        $provinces = Province::all();
        
        // Load sẵn quan hệ để frontend có thể hiển thị dữ liệu hiện tại (nếu cần)
        $destination->load(['province.country']);

        return Inertia::render("Destinations/edit", [
            "destination" => $destination,
            "countries" => $countries,
            "provinces" => $provinces
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDestinationRequest $request, Destination $destination)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "province_id" => "required|exists:provinces,id",
            "address" => "required|string",
            "status" => "required",
            "description" => "nullable|string",
        ]);

        $destination->update([
            "name" => $request->input("name"),
            "province_id" => $request->input("province_id"),
            "address" => $request->input("address"),
            "status" => $request->input("status"),
            "description" => $request->input("description"),
        ]);

        return redirect()->route("destination.index")->with("message", "Sửa điểm đến thành công!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Destination $destination)
    {
        $destination->delete();
        return redirect()->route("destination.index")->with("message", "Xoá điểm đến thành công");
    }
}