<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Destination;
use App\Models\Province;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Destination>
 */
class DestinationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         $province = Province::inRandomOrder()->first();
        return [
            "name" => $this->fake()->sentence(2),
            "province_id" => $province ? $province->id : null,
            "status" => $this->fake()->sentence(2),
            "address" => $this->fake()->sentence(2),
            "description" => $this->fake()->sentence(2),
        ];
    }
}
