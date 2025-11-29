<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\TripAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TripAssignment>
 */
class TripAssignmentFactory extends Factory
{
    protected $model = TripAssignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Mặc định tạo booking mới nếu không truyền vào (để an toàn khi test)
            // Khi chạy Seeder, giá trị này sẽ bị ghi đè bởi booking thực tế
            'booking_id' => Booking::factory(),

            'user_id' => null,

            // Tự động tính toán số khách dựa trên booking_id được truyền vào (hoặc tạo mới)
            'total_passengers' => function (array $attributes) {
                $booking = Booking::find($attributes['booking_id']);
                return $booking ? ($booking->count_adult + $booking->count_children) : 1;
            },

            // Random status từ 0 đến 3
            'status' => (string) fake()->numberBetween(0, 3),
        ];
    }
}