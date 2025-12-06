<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Xóa FK cũ nếu có (tránh lỗi 1091) bằng cách kiểm tra information_schema
        $drops = [
            'tour_instances_tour_template_id_foreign',
            'tour_instances_tour_id_foreign',
        ];
        foreach ($drops as $fk) {
            $exists = \Illuminate\Support\Facades\DB::selectOne("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_NAME = 'tour_instances' 
                  AND CONSTRAINT_SCHEMA = DATABASE() 
                  AND CONSTRAINT_NAME = ?
            ", [$fk]);
            if ($exists) {
                \Illuminate\Support\Facades\DB::statement("
                    ALTER TABLE tour_instances DROP FOREIGN KEY {$fk}
                ");
            }
        }

        Schema::table('tour_instances', function (Blueprint $table) {
            if (!Schema::hasColumn('tour_instances', 'tour_template_id')) {
                $table->unsignedBigInteger('tour_template_id')->nullable()->after('id');
            }
        });

        // Thêm FK đúng sang tour_templates (dùng raw để tránh lỗi tên)
        \Illuminate\Support\Facades\DB::statement("
            ALTER TABLE tour_instances
            ADD CONSTRAINT fk_tour_instances_template
            FOREIGN KEY (tour_template_id)
            REFERENCES tour_templates(id)
            ON DELETE CASCADE
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_instances', function (Blueprint $table) {
            try {
                $table->dropForeign(['tour_template_id']);
            } catch (\Exception $e) {
                // ignore
            }
            try {
                $table->dropForeign('tour_instances_tour_template_id_foreign');
            } catch (\Exception $e) {
                // ignore
            }
        });
    }
};
