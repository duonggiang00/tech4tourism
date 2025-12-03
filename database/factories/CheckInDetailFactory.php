<?php

namespace Database\Factories;

use App\Models\CheckInDetail;
use App\Models\Passenger;
use App\Models\TripCheckIn;
use Illuminate\Database\Eloquent\Factories\Factory;

class CheckInDetailFactory extends Factory
{
    protected $model = CheckInDetail::class;

    public function definition(): array
    {
        return [
            // Không cố gắng truy ngược logic ở đây nữa.
            // Nếu Seeder truyền vào id thì nó sẽ dùng id đó.
            // Nếu không truyền, nó tự tạo mới độc lập (để tránh lỗi null).

            'trip_check_in_id' => TripCheckIn::factory(),

            'passenger_id' => Passenger::factory(), // Tự động tạo booking -> tạo tour -> tạo user nếu cần

            'is_present' => fake()->boolean(90),
            'notes' => fake()->optional(0.2)->sentence(),
        ];
    }
}