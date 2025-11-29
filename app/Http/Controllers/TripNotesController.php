<?php

namespace App\Http\Controllers;

use App\Models\TripNotes;
use App\Http\Requests\StoreTripNotesRequest;
use App\Http\Requests\UpdateTripNotesRequest;

class TripNotesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreTripNotesRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TripNotes $tripNotes)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TripNotes $tripNotes)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTripNotesRequest $request, TripNotes $tripNotes)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TripNotes $tripNotes)
    {
        //
    }
}
