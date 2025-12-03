<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\User;
use App\Models\TripAssignment;
use Illuminate\Database\Seeder;

class TripAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Lấy tất cả Tour hiện có
        $tours = Tour::all();

        // 2. Lấy danh sách User (giả định tất cả user đều có thể làm Guide)
        // Nếu bạn có phân quyền, hãy thêm ->where('role', 'guide')
        $users = User::all();

        // Kiểm tra data đầu vào để tránh lỗi
        if ($tours->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Cần có Tours và Users trước khi chạy TripAssignmentSeeder!');
            return;
        }

        // 3. Duyệt qua từng Tour và gán hướng dẫn viên
        foreach ($tours as $tour) {

            // Kiểm tra xem tour này đã được gán chưa (tránh trùng lặp nếu chạy seeder nhiều lần)
            $isAssigned = TripAssignment::where('tour_id', $tour->id)->exists();

            if (!$isAssigned) {
                TripAssignment::factory()->create([
                    'tour_id' => $tour->id,

                    // Chọn ngẫu nhiên 1 người từ danh sách guides
                    'user_id' => $users->random()->id,

                    // Bạn có thể random status, hoặc mặc định là '0' (Mới phân công)
                    'status' => fake()->randomElement(['0', '1', '2']),
                ]);
            }
        }
    }
}