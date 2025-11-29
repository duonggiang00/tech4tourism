<?php

namespace Database\Seeders;

use App\Models\CheckInDetail;
use App\Models\TripCheckIn;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CheckInDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all existing trip check-ins and eager load the necessary relationships
        // to access passengers via TripAssignment -> Booking -> Passengers
        $checkIns = TripCheckIn::with('tripAssignment.booking.passengers')->get();

        foreach ($checkIns as $checkIn) {
            // Get the list of passengers for this specific trip
            $passengers = $checkIn->tripAssignment->booking->passengers;

            foreach ($passengers as $passenger) {
                // Create a check-in detail record for each passenger
                CheckInDetail::factory()->create([
                    'trip_check_in_id' => $checkIn->id,
                    'passenger_id' => $passenger->id,
                ]);
            }
        }
    }
}