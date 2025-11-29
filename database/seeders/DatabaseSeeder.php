<?php

namespace Database\Seeders;

use App\Models\Providers;
use App\Models\ServiceAttributes;
use App\Models\Services;
use App\Models\ServiceTypes;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::firstOrCreate(
        //     ['email' => 'test@example.com'],
        //     [
        //         'name' => 'Test User',
        //         'password' => 'password',
        //         'email_verified_at' => now(),
        //     ]
        // );
        $this->call([
            UserSeeder::class,
            CountrySeeder::class,
            ProvinceSeeder::class,
            DestinationSeeder::class,
            CategorySeeder::class,
            TourSeeder::class,
            TestSeeder::class,
            TourImageSeeder::class,
            BookingSeeder::class,
            ServiceTypeSeeder::class,
            ProviderSeeder::class,
            ServiceSeeder::class,
            ServiceAttributeSeeder::class,
            TourServiceSeeder::class,
            PolicySeeder::class,
            TourPolicySeeder::class,
            TripAssignmentSeeder::class,
            TripNotesSeeder::class,
            TripCheckInSeeder::class,
            CheckInDetailSeeder::class
        ]);
    }
}
