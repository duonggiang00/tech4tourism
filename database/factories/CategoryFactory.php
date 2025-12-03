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
        // Danh sách danh mục cần tạo
        $categories = [
            [
                'title' => 'Du lịch Quốc tế',
                'description' => 'Các tour du lịch nước ngoài hấp dẫn.',
                'status' => '1' // 1: Hoạt động
            ],
            [
                'title' => 'Du lịch Nội địa',
                'description' => 'Khám phá vẻ đẹp Việt Nam.',
                'status' => '1'
            ],
            [
                'title' => 'Tour tùy chọn',
                'description' => 'Thiết kế tour theo yêu cầu riêng.',
                'status' => '1'
            ],
        ];

        foreach ($categories as $data) {
            // Kiểm tra theo 'title', nếu chưa có thì tạo mới
            Category::firstOrCreate(
                ['title' => $data['title']], // Điều kiện tìm kiếm
                [
                    'description' => $data['description'],
                    'status' => $data['status']
                ]
            );
        }
    }
}