<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Province;
use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use Inertia\Inertia;

class CountryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    
    public function index()
    {
        //
        $countries = Country::all();
        $provinces = Province::all();
        return Inertia::render('Countries/index',compact('countries', "provinces"));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Countries/create', []);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCountryRequest $request)
    {
        //
        // dd($request);

        Country::create($request->validated());
        return redirect()->route('countries.index')->with('message','Tạo quốc gia thành công');
       
    }

    /**
     * Display the specified resource.
     */
    public function show(Country $country)
    {
        //
        $province = Province::all();
        return Inertia::render("Countries/countryDetail", [
            "country" => $country,
            "province" => $province
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Country $country)
    {
        //
        return Inertia::render('Countries/edit',compact('country'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCountryRequest $request, Country $country)
    {
        //
        $country->update($request->validated());
        return redirect()->route('countries.index')->with('message', 'Sửa quốc gia thành công');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Country $country)
    {
        //
        $country->delete();
        return redirect()->route('countries.index')->with('message','Xóa Quốc gia thành công');
    }
}
