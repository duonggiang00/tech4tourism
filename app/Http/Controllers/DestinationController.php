<?php

namespace App\Http\Controllers;

use App\Models\Destination;
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
        $destinations = Destination::all();
        return Inertia::render("Destinations/index", compact("destinations"));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render("Destinations/create",[]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDestinationRequest $request)
    {
        //
        $request->validate([
            "name" => "required|string|max:255",
            "province_id" => "required",
            "address" => "required|string",
            "status" => "required",
            "description" => "string",
        ]);

        Destination::create($request->all());
        return redirect()->route("destination.index")->with("message", "Thêm mới thành công!");
    }

    /**
     * Display the specified resource.
     */
    public function show(Destination $destination)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Destination $destination)
    {
        //
        return Inertia::render("Destinations/edit", compact("destination"));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDestinationRequest $request, Destination $destination)
    {
        //
              $request->validate([
            "name" => "required|string|max:255",
            "province_id" => "required",
            "address" => "required|string",
            "status" => "required",
            "description" => "string",
        ]);

        $destination->update([
            "name" => $request->input("name"),
            "province_id" =>  $request->input("province_id"),
            "address" =>  $request->input("address"),
            "status" => $request->input("status"),
            "description" =>  $request->input("description"),
        ]);

        return redirect()->route("destination.index")->with("message", "Sửa điểm đến thành công!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Destination $destination)
    {
        //
    }
}
