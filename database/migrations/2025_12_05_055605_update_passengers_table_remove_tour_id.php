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
        Schema::table('passengers', function (Blueprint $table) {
            // Xóa tour_id nếu có
            if (Schema::hasColumn('passengers', 'tour_id')) {
                // Kiểm tra foreign key trước khi xóa
                $foreignKeys = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'passengers' 
                    AND COLUMN_NAME = 'tour_id' 
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ");
                
                if (!empty($foreignKeys)) {
                    $table->dropForeign([$foreignKeys[0]->CONSTRAINT_NAME]);
                }
                $table->dropColumn('tour_id');
            }
        });
        
        // Kiểm tra foreign key booking_id đã tồn tại chưa
        $existingFk = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'passengers' 
            AND COLUMN_NAME = 'booking_id' 
            AND REFERENCED_TABLE_NAME = 'bookings'
        ");
        
        // Nếu chưa có foreign key và đã có cột booking_id
        if (empty($existingFk) && Schema::hasColumn('passengers', 'booking_id')) {
            Schema::table('passengers', function (Blueprint $table) {
                $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            // Không rollback vì đây là chuẩn hóa
            // Nếu cần rollback, có thể thêm lại tour_id
        });
    }
};
