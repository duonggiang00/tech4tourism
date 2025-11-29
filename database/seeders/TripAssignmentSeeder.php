<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\TripAssignment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TripAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy tất cả các booking đang có trong DB
        $bookings = Booking::all();

        foreach ($bookings as $booking) {
            // Tạo TripAssignment gắn liền với booking đó
            TripAssignment::factory()->create([
                'booking_id' => $booking->id,

                // Tự động tính tổng hành khách dựa trên dữ liệu booking
                'total_passengers' => $booking->count_adult + $booking->count_children,

                // Ép kiểu sang string vì cột status là enum('0','1'...)
                'status' => (string) fake()->numberBetween(0, 3),
            ]);
        }
    }
}