<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProvinceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('provinces')->insert(
            [
                [
                    'id_country' => 1,
                    'name' => 'Thành Phố Hà Nội',
                    'description' => 'Thủ đô của đất nước Việt Nam',
                    'thumbnail' => 'hanoi.jpg',
                    'order' => '1',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'id_country' => 2,
                    'name' => 'Thành Phố Hồ Chí Minh',
                    'description' => 'Trung tâm kinh tế lớn nhất của đất nước Việt Nam',
                    'thumbnail' => 'tphcm.jpg',
                    'order' => '2',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'id_country' => 3,
                    'name' => 'Thành Phố Huế',
                    'description' => 'Kinh đô của triều Nguyễn',
                    'thumbnail' => 'hue.jpg',
                    'order' => '3',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
            ]
        );
    }
}
