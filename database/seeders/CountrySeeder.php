<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('countries')->insert([
            [
                'name' => 'Việt Nam',
                'code' => 'VN',
                'description' => 'Đất nước Việt Nam hình chữ S nằm ở Đông Nam Á',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Trung Quốc',
                'code' => 'CN',
                'description' => 'Trung Quốc, quốc hiệu là Cộng hòa Nhân dân Trung Hoa, là một quốc gia nằm ở khu vực Đông Á và là một trong hai quốc gia tỷ dân.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nhật Bản',
                'code' => 'JP',
                'description' => 'Nhật Bản, tên đầy đủ là Nhật Bản Quốc, là một quốc gia và đảo quốc ở khu vực Đông Á.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hàn Quốc',
                'code' => 'SK',
                'description' => 'Đại Hàn Dân Quốc, gọi tắt là Hàn Quốc là một quốc gia ở Đông Á; cấu thành nửa phía nam bán đảo Triều Tiên.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
