<?php

namespace Database\Factories;

use App\Models\Passenger;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Passenger>
 */
class PassengerFactory extends Factory
{
    protected $model = Passenger::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->numberBetween(0, 2); // 0: Adult, 1: Child, 2: Infant
        
        // Nếu là trẻ em hoặc em bé, ngày sinh sẽ gần đây hơn
        if ($type === 1) {
            $birth = fake()->dateTimeBetween('-12 years', '-2 years');
        } elseif ($type === 2) {
            $birth = fake()->dateTimeBetween('-2 years', 'now');
        } else {
            $birth = fake()->dateTimeBetween('-60 years', '-18 years');
        }

        return [
            'fullname' => fake()->name(),
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'gender' => fake()->numberBetween(0, 1), // 0: Male, 1: Female
            'birth' => $birth,
            'type' => $type,
            'request' => fake()->optional(0.3)->sentence(), // 30% có yêu cầu đặc biệt
        ];
    }
}

