<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceAttribute;

class ServiceAttributeSeeder extends Seeder
{
    public function run(): void
    {
        ServiceAttribute::factory(30)->create();
    }
}
