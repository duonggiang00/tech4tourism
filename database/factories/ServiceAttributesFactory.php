<?php

namespace Database\Factories;

use App\Models\Services;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceAttributes>
 */
class ServiceAttributesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_service' => Services::inRandomOrder()->first()->id ?? 1,
            'name' => $this->faker->randomElement(['Wifi', 'Bãi đỗ xe', 'Bữa sáng', 'Hồ bơi', 'Hướng dẫn viên']),
            'value' => $this->faker->randomElement(['Miễn phí', 'Có', 'Không', 'Bao gồm']),
            'type' => $this->faker->randomElement(['Tiện ích', 'Quy định', 'Dịch vụ kèm theo']),
        ];
    }
}