<?php

namespace Database\Seeders;

use App\Models\TripAssignment;
use App\Models\TripCheckIn;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TripCheckInSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy tất cả các trip assignment đang có trong DB
        $assignments = TripAssignment::all();

        foreach ($assignments as $assignment) {
            // Tạo ngẫu nhiên 1-3 lần điểm danh cho mỗi chuyến đi
            TripCheckIn::factory(rand(1, 3))->create([
                'trip_assignment_id' => $assignment->id,
            ]);
        }
    }
}