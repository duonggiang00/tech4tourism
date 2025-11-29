<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourService>
 */
class TourServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $service = Service::factory()->create();
        $quantity = $this->faker->numberBetween(1, 10);
        $priceUnit = $service->price;

        return [
            // Tạo Tour mới nếu không được truyền vào từ bên ngoài
            'tour_id' => Tour::factory(),
            'service_id' => $service->id,
            'unit' => $service->unit ?? $this->faker->randomElement(['người', 'xe', 'phòng', 'suất']),
            'price_unit' => $priceUnit,
            'quantity' => $quantity,
            'price_total' => $priceUnit * $quantity,
            'description' => $this->faker->sentence(),
        ];
    }
}