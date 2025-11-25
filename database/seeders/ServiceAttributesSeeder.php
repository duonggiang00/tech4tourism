<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceAttributes;

class ServiceAttributesSeeder extends Seeder
{
    public function run(): void
    {
        ServiceAttributes::factory(30)->create();
    }
}
