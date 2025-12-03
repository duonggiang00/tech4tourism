<?php

namespace Database\Factories;

use App\Models\TripAssignment;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripAssignmentFactory extends Factory
{
    protected $model = TripAssignment::class;

    public function definition(): array
    {
        return [
            'tour_id' => Tour::factory(),
            'user_id' => User::factory(),

            'status' => fake()->randomElement(['0', '1', '2', '3']),
        ];
    }
}