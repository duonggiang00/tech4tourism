<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Tour;
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
        $categoryId = Category::inRandomOrder()->first()->id;
        return [
            //
            'category_id' => $categoryId,
            'title' =>fake()->unique()->sentence(6),
            'day'=>fake()->numberBetween(2,10),
            'night'=>fake()->numberBetween(1,9),
            'thumbnail'=>fake()->imageUrl(640,480,'travel',true),
            'description'=>fake()->paragraph(3,true),
            'short_description'=>fake()->sentence(25),
            'price_adult'=>fake()->randomFloat(2,50,5000),
            'price_children'=>fake()->randomFloat(2,50,2500),
        ];
    }
}
