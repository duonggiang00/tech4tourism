<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Destinations;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tour>
 */
class TourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Tour::class;

    public function definition(): array
    {
     
        $days = fake()->numberBetween(1, 15);
        $nights = ($days > 1) ? $days - 1 : 0;

        $dateStart = fake()->dateTimeBetween('+1 week', '+6 months');
        $dateEnd = (clone $dateStart)->modify('+' . $days . ' days');

        $priceAdult = fake()->randomFloat(2, 50, 5000);
        $priceChildren = $priceAdult * fake()->randomFloat(2, 0.5, 0.9); // 50% đến 90% giá người lớn

        return [
            'category_id' => Category::factory(), 
            'destination_id' => Destinations::inRandomOrder()->first()->id,

            'title' => fake()->unique()->sentence(6), // Tăng số từ lên một chút cho giống tên tour
            'status' => fake()->numberBetween(0, 2), // 0: Hidden, 1: Active, 2: Draft (ví dụ)
            
            'day' => $days,
            'night' => $nights,

            'date_start' => $dateStart->format('Y-m-d'),
            'date_end' => $dateEnd->format('Y-m-d'),
            
            'limit' => fake()->numberBetween(5, 50), // Giới hạn số người tham gia

            'thumbnail' => fake()->imageUrl(640, 480, 'travel', true),
            'description' => fake()->paragraph(5, true),
            'short_description' => fake()->text(200), // Dùng text để kiểm soát độ dài tốt hơn sentence
            
            'price_adult' => $priceAdult,
            'price_children' => $priceChildren,
        ];
    }
}