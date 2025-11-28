<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\Service;
use App\Models\ServiceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_type_id' => Service::inRandomOrder()->value('id') ?? ServiceType::factory(),
            'provider_id' => Provider::inRandomOrder()->value('id') ?? Provider::factory(),

            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 10, 500),

            'type_room' => $this->faker->randomElement(['Phòng đơn', 'Phòng đôi', 'Suite', null]),
            'type_car' => $this->faker->randomElement(['Sedan', 'SUV', 'Xe giường nằm', null]),
            'type_meal' => $this->faker->randomElement(['Buffet sáng', 'Cơm trưa', 'Set menu', null]),

            'limit' => $this->faker->numberBetween(5, 100),
            'unit' => $this->faker->randomElement(['người', 'phòng', 'xe', 'suất']),

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
