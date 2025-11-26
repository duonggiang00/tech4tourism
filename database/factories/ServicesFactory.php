<?php

namespace Database\Factories;

use App\Models\Providers;
use App\Models\Services;
use App\Models\ServiceTypes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Services>
 */
class ServicesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_service_type' => Services::inRandomOrder()->value('id') ?? ServiceTypes::factory(),
            'id_provider' => Providers::inRandomOrder()->value('id') ?? Providers::factory(),

            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 10, 500),

            'type_room' => $this->faker->randomElement(['Phòng đơn', 'Phòng đôi', 'Suite', null]),
            'type_car' => $this->faker->randomElement(['Sedan', 'SUV', 'Xe giường nằm', null]),
            'type_meal' => $this->faker->randomElement(['Buffet sáng', 'Cơm trưa', 'Set menu', null]),

            'limit' => $this->faker->numberBetween(5, 100),
            'unit' => $this->faker->randomElement(['người', 'phòng', 'xe', 'suất']),
            'priceDefault' => $this->faker->numberBetween(100, 999) . 'k',

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
