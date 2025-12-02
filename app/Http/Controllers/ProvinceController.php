<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\Country;
use App\Http\Requests\StoreProvinceRequest;
use App\Http\Requests\UpdateProvinceRequest;
use Inertia\Inertia;

class ProvinceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $provinces = Province::with('country')->get();

        return Inertia::render('Province/index', [
            'provinces' => $provinces->map(fn($province) => [
                'id' => $province->id,
                'name' => $province->name,
                'description' => $province->description,
                'country_id' => $province->country ? [
                    'id' => $province->country->id,
                    'name' => $province->country->name,
                ] : null,
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        $countries = Country::all();
        return Inertia::render("Province/create", [
            "countries" => $countries
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProvinceRequest $request)
    {
        //
        $request->validate([
            "name" => "required|string|max:255",
            "country_id"=> "required|integer",
            "description" => "required|string",
        ]);
        Province::create($request->all());
        return redirect()->route("province.index")->with("message", "Thêm tỉnh thành mới thành công");
    }

    /**
     * Display the specified resource.
     */
    public function show(Province $province)
    {
        //
  
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Province $province)
    {
        $countries = Country::all();
        return Inertia::render("Province/edit", [
            "province" => $province,
            "countries" => $countries
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProvinceRequest $request, Province $province)
    {
        //
        $request->validate([
            "name" => "required|string|max:255",
            "country_id"=> "required|integer",
            "description" => "required|string",
        ]);

        $province->update([
            'name' => $request->input("name"),
            'country_id' => $request->input("country_id"),
            'description' => $request->input("description"),
        ]);

        return redirect()->route("province.index")->with("message", "Sửa tỉnh thành, thành công!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Province $province)
    {
        //
        $province->delete();
        return redirect()->route("province.index")->with("message","Xoá tỉnh thành thành công");
    }
}
