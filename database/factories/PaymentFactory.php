<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'amount' => fake()->randomFloat(2, 100000, 5000000),
            'method' => fake()->numberBetween(0, 2), // 0: Tiền mặt, 1: Chuyển khoản, 2: Thẻ tín dụng
            'status' => fake()->numberBetween(0, 1), // 0: Thất bại, 1: Thành công
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'thumbnail' => fake()->optional(0.5)->imageUrl(640, 480, 'receipt', true), // 50% có ảnh biên lai
        ];
    }
}

