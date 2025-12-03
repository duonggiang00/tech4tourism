<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        $categories = [
            [
                'title' => 'Du lịch Quốc tế',
                'description' => 'Các tour du lịch nước ngoài hấp dẫn.',
            ],
            [
                'title' => 'Du lịch Nội địa',
                'description' => 'Khám phá vẻ đẹp Việt Nam.',
            ],
            [
                'title' => 'Tour tùy chọn',
                'description' => 'Thiết kế tour theo yêu cầu riêng.',
            ],
        ];

        foreach ($categories as $data) {
         
            Category::firstOrCreate(
                ['title' => $data['title']],
                [
                    'description' => $data['description'],
                ]
            );
        }
    }
}