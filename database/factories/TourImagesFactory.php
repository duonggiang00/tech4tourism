<?php

namespace Database\Factories;

use App\Models\Tour;
use App\Models\TourImages;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourImages>
 */
class TourImagesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = TourImages::class;
    public function definition(): array
    {
        $tourId = Tour::inRandomOrder()->first()->id;
        return [
            //
            'tour_id'=>$tourId,
            'img_url'=>fake()->imageUrl(640,480,'travel',true),
            'alt'=>fake()->sentence(3),
            'order'=>fake()->numberBetween(1,10)
        ];
    }
}
