<?php

namespace Database\Factories;

use App\Models\Policy;
use App\Models\Tour;
use App\Models\TourPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourPolicy>
 */
class TourPolicyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = TourPolicy::class;
    public function definition(): array
    {
        $tourId = Tour::inRandomOrder()->first()->id;
        $policyId = Policy::inRandomOrder()->first()->id;
        return [
            //
            'tour_id'=>$tourId,
            'policy_id'=>$policyId

        ];
    }
}
