<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Chỉ chạy nếu bảng tours đã tồn tại và có dữ liệu
        if (!Schema::hasTable('tours')) {
            return;
        }

        // Kiểm tra xem bảng tours có cột date_start không
        $hasDateStart = Schema::hasColumn('tours', 'date_start');
        
        $tours = DB::table('tours')->get();

        foreach ($tours as $tour) {
            // 1. Tạo TourTemplate từ tour cũ (loại bỏ date_start, date_end, limit, price, status)
            $templateId = DB::table('tour_templates')->insertGetId([
                'category_id' => $tour->category_id,
                'province_id' => $tour->province_id,
                'user_id' => $tour->user_id ?? null,
                'title' => $tour->title,
                'day' => $tour->day,
                'night' => $tour->night,
                'thumbnail' => $tour->thumbnail,
                'description' => $tour->description,
                'short_description' => $tour->short_description,
                'created_at' => $tour->created_at,
                'updated_at' => $tour->updated_at,
            ]);

            // 2. Tạo TourInstance nếu tour có date_start
            $dateStart = $hasDateStart ? ($tour->date_start ?? null) : null;
            
            if ($dateStart) {
                $instanceId = DB::table('tour_instances')->insertGetId([
                    'tour_template_id' => $templateId,
                    'date_start' => $dateStart,
                    'date_end' => ($hasDateStart && isset($tour->date_end)) ? $tour->date_end : null,
                    'limit' => (Schema::hasColumn('tours', 'limit')) ? ($tour->limit ?? null) : null,
                    'booked_count' => DB::table('bookings')->where('tour_id', $tour->id)->count(),
                    'price_adult' => (Schema::hasColumn('tours', 'price_adult')) ? ($tour->price_adult ?? null) : null,
                    'price_children' => (Schema::hasColumn('tours', 'price_children')) ? ($tour->price_children ?? null) : null,
                    'status' => (Schema::hasColumn('tours', 'status')) ? ($tour->status ?? 1) : 1,
                    'created_at' => $tour->created_at,
                    'updated_at' => $tour->updated_at,
                ]);

                // 3. Cập nhật bookings: thêm tour_instance_id
                DB::table('bookings')
                    ->where('tour_id', $tour->id)
                    ->update(['tour_instance_id' => $instanceId]);

                // 4. Cập nhật trip_assignments: thêm tour_instance_id
                DB::table('trip_assignments')
                    ->where('tour_id', $tour->id)
                    ->update(['tour_instance_id' => $instanceId]);
            }

            // 5. Cập nhật tour_schedules, tour_services, tour_policies, tour_images: đổi tour_id → tour_template_id
            DB::table('tour_schedules')
                ->where('tour_id', $tour->id)
                ->update(['tour_id' => $templateId]); // Tạm thời giữ tên cột, sẽ đổi sau

            DB::table('tour_services')
                ->where('tour_id', $tour->id)
                ->update(['tour_id' => $templateId]);

            DB::table('tour_policies')
                ->where('tour_id', $tour->id)
                ->update(['tour_id' => $templateId]);

            DB::table('tour_images')
                ->where('tour_id', $tour->id)
                ->update(['tour_id' => $templateId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Không rollback vì đây là migration dữ liệu
        // Nếu cần rollback, phải restore từ backup
    }
};
