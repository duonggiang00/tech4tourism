<?php

namespace Database\Seeders;

use App\Models\TourPolicy;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        TourPolicy::factory()->count(10)->create();
    }
}
