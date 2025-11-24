<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourSchedule;
use Illuminate\Http\Request;

class TourScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($tourId)
    {
        //
        $schedules = TourSchedule::where('tour_id', $tourId)->get();
        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TourSchedule $tourSchedule)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TourSchedule $tourSchedule)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TourSchedule $tourSchedule)
    {
        //
    }
}
