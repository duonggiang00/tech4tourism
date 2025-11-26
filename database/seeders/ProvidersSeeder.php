<?php

namespace Database\Seeders;

use App\Models\Providers;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProvidersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Providers::factory()->count(10)->create();
    }
}
