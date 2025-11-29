<?php

namespace Database\Factories;

use App\Models\CheckInDetail;
use App\Models\Passenger;
use App\Models\TripCheckIn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CheckInDetail>
 */
class CheckInDetailFactory extends Factory
{
    protected $model = CheckInDetail::class;

    public function definition(): array
    {
        // 1. Lấy ngẫu nhiên một đợt check-in đã có
        $checkIn = TripCheckIn::inRandomOrder()->first() ?? TripCheckIn::factory()->create();

        // 2. Truy ngược để tìm Booking ID: TripCheckIn -> TripAssignment -> Booking
        // Đảm bảo bạn đã định nghĩa relation tripAssignment() trong TripCheckIn và booking() trong TripAssignment
        $bookingId = $checkIn->tripAssignment->booking_id;

        // 3. Lấy ngẫu nhiên hành khách thuộc Booking đó
        $passenger = Passenger::where('booking_id', $bookingId)->inRandomOrder()->first();

        // Fallback: Nếu booking đó chưa có khách (hiếm khi xảy ra nếu seed đúng thứ tự), tạo mới 1 khách gán vào booking đó
        if (!$passenger) {
            $passenger = Passenger::factory()->create(['booking_id' => $bookingId]);
        }

        return [
            'trip_check_in_id' => $checkIn->id,
            'passenger_id' => $passenger->id,
            'is_present' => fake()->boolean(90), // 90% là có mặt
            'notes' => fake()->optional(0.2)->sentence(), // 20% có ghi chú
        ];
    }
}