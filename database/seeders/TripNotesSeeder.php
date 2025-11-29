<?php

namespace Database\Seeders;

use App\Models\TripAssignment;

use App\Models\TripNotes;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TripNotesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy tất cả các trip assignment đang có trong DB
        $assignments = TripAssignment::all();

        foreach ($assignments as $assignment) {
            // Tạo ngẫu nhiên 1-3 ghi chú cho mỗi chuyến đi
            TripNotes::factory(rand(1, 3))->create([
                'trip_assignment_id' => $assignment->id,
            ]);
        }
    }
}