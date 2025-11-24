<?php

namespace Database\Factories;

use App\Models\Tour;
use App\Models\TourSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourSchedule>
 */
class TourScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = TourSchedule::class;
    public function definition(): array
    {
        $tourId = Tour::inRandomOrder()->first()->id;
        return [
            //
            'tour_id' => $tourId,
            'name'=>fake()->sentence(2),
            'description'=>fake()->paragraph(2),
            'date'=>fake()->numberBetween(1,5),
            'breakfast'=>fake()->boolean(),
            'lunch'=>fake()->boolean(),
            'dinner'=>fake()->boolean(),
        ];
    }
}
