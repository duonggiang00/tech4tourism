<?php

namespace Database\Factories;

use App\Models\Providers;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Providers>
 */
class ProvidersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Providers::class;
    public function definition(): array
    {
        return [
            'id_destination' => null, // Nếu sau này có bảng destinations thì có thể đổi thành Destination::factory()
            'name' => $this->faker->company(),
            'description' => $this->faker->sentence(),
            'email' => $this->faker->unique()->safeEmail(),
            'hotline' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'website' => $this->faker->url(),
            'status' => $this->faker->randomElement(['0', '1', '2']),
            'notes' => $this->faker->sentence(8),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
