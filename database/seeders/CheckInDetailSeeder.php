<?php

namespace Database\Seeders;

use App\Models\CheckInDetail;
use App\Models\TripCheckIn;
use Illuminate\Database\Seeder;

class CheckInDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Eager Load đúng đường dẫn: 
        // TripCheckIn -> TripAssignment -> Tour -> Bookings (số nhiều) -> Passengers
        $checkIns = TripCheckIn::with('tripAssignment.tour.bookings.passengers')->get();

        foreach ($checkIns as $checkIn) {

            // Kiểm tra an toàn: Nếu assignment hoặc tour bị xóa thì bỏ qua
            if (!$checkIn->tripAssignment || !$checkIn->tripAssignment->tour) {
                continue;
            }

            // 2. Lấy danh sách Bookings (Số nhiều)
            // Lưu ý: Trong Model Tour phải có function bookings() { return $this->hasMany(...) }
            $bookings = $checkIn->tripAssignment->tour->bookings;

            // 3. Duyệt qua từng Booking để lấy khách
            foreach ($bookings as $booking) {

                // Duyệt qua từng hành khách trong booking đó
                foreach ($booking->passengers as $passenger) {

                    CheckInDetail::factory()->create([
                        'trip_check_in_id' => $checkIn->id,
                        'passenger_id' => $passenger->id,
                        // Thêm status hoặc các trường khác nếu cần
                    ]);
                }
            }
        }
    }
}