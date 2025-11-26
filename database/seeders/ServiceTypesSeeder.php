<?php

namespace Database\Seeders;

use App\Models\Service_types;
use App\Models\ServiceTypes;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ServiceTypes::factory()->count(10)->create();
    }
}
