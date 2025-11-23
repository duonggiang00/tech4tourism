<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Passenger;
use App\Models\Payment;
use App\Models\Tour;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Đảm bảo có ít nhất một tour
        if (Tour::count() === 0) {
            $this->command->warn('Không có tour nào. Vui lòng chạy TourSeeder trước.');
            return;
        }

        // Tạo 10 bookings
        Booking::factory(10)->create()->each(function ($booking) {
            // Tạo passengers dựa trên số người lớn và trẻ em
            // Tạo người lớn
            for ($i = 0; $i < $booking->count_adult; $i++) {
                Passenger::factory()->create([
                    'booking_id' => $booking->id,
                    'type' => 0, // Adult
                    'gender' => fake()->numberBetween(0, 1),
                ]);
            }

            // Tạo trẻ em
            for ($i = 0; $i < $booking->count_children; $i++) {
                Passenger::factory()->create([
                    'booking_id' => $booking->id,
                    'type' => 1, // Child
                    'gender' => fake()->numberBetween(0, 1),
                ]);
            }

            // Nếu booking đã thanh toán một phần (left_payment < final_price)
            // thì tạo một số payments
            if ($booking->left_payment < $booking->final_price) {
                $paidAmount = $booking->final_price - $booking->left_payment;
                
                // Có thể chia thành nhiều lần thanh toán hoặc 1 lần
                $numberOfPayments = fake()->numberBetween(1, 3);
                $amountPerPayment = $paidAmount / $numberOfPayments;

                for ($i = 0; $i < $numberOfPayments; $i++) {
                    Payment::factory()->create([
                        'booking_id' => $booking->id,
                        'amount' => $i === $numberOfPayments - 1 
                            ? $paidAmount - ($amountPerPayment * ($numberOfPayments - 1)) // Lần cuối lấy phần còn lại
                            : $amountPerPayment,
                        'status' => 1, // Thành công
                        'method' => fake()->numberBetween(0, 2),
                        'date' => fake()->dateTimeBetween($booking->created_at, 'now'),
                    ]);
                }
            }
        });

        $this->command->info('Đã tạo 10 bookings với passengers và payments!');
    }
}

