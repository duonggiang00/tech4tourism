<?php

namespace Database\Factories;

use App\Models\TripAssignment;
use App\Models\TripCheckIn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TripCheckIn>
 */
class TripCheckInFactory extends Factory
{
    protected $model = TripCheckIn::class;

    public function definition(): array
    {
        // Lấy ngẫu nhiên một chuyến đi đã có
        $assignment = TripAssignment::inRandomOrder()->first() ?? TripAssignment::factory()->create();

        return [
            'trip_assignment_id' => $assignment->id,
            'title' => fake()->randomElement(['Tập trung', 'Lên xe', 'Ăn trưa', 'Nhận phòng', 'Tham quan']),
            'checkin_time' => fake()->dateTimeBetween('-1 week', '+1 week'),
        ];
    }
}