<?php

namespace Database\Factories;

use App\Models\Policy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Policy>
 */
class PolicyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Policy::class;
    public function definition(): array
    {
        return [
            //
            'title'=>fake()->unique()->sentence(2),
            'content'=>fake()->paragraph(6),
        ];
    }
}
