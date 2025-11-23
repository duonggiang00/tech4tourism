<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tour = Tour::inRandomOrder()->first() ?? Tour::factory()->create();
        $dateStart = fake()->dateTimeBetween('now', '+3 months');
        $dateEnd = Carbon::parse($dateStart)->addDays($tour->day);
        
        $countAdult = fake()->numberBetween(1, 4);
        $countChildren = fake()->numberBetween(0, 2);
        
        $finalPrice = ($tour->price_adult * $countAdult) + 
                      ($tour->price_children * $countChildren);
        
        // Có thể đã thanh toán một phần hoặc chưa
        $leftPayment = fake()->randomFloat(2, 0, $finalPrice);
        
        return [
            'code' => 'BK-' . strtoupper(Str::random(6)),
            'id_tour_instance' => $tour->id,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'client_name' => fake()->name(),
            'client_phone' => fake()->phoneNumber(),
            'client_email' => fake()->safeEmail(),
            'count_adult' => $countAdult,
            'count_children' => $countChildren,
            'final_price' => $finalPrice,
            'left_payment' => $leftPayment,
            'status' => fake()->numberBetween(0, 3), // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
        ];
    }
}

