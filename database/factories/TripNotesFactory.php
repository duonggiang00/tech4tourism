<?php

namespace Database\Factories;

use App\Models\TripAssignment;
use App\Models\TripNotes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TripNotes>
 */
class TripNotesFactory extends Factory
{
    protected $model = TripNotes::class;

    public function definition(): array
    {
        // Lấy ID của chuyến đi ngẫu nhiên có sẵn
        $tripAssignmentId = TripAssignment::inRandomOrder()->first()->id ?? TripAssignment::factory()->create()->id;

        return [
            'trip_assignment_id' => $tripAssignmentId,
            'content' => fake()->paragraph(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}