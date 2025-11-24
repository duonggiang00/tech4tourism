<?php

namespace Database\Seeders;

use App\Models\TourSchedule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        TourSchedule::factory()->count(10)->create();
    }
}
