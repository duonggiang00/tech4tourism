<?php

namespace Database\Seeders;

use App\Models\TourService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        TourService::factory()->count(10)->create();
    }
}
