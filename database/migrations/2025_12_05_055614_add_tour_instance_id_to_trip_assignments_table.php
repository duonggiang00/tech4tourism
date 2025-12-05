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
        Schema::table('trip_assignments', function (Blueprint $table) {
            // Kiểm tra nếu cột đã tồn tại thì bỏ qua
            if (!Schema::hasColumn('trip_assignments', 'tour_instance_id')) {
                $table->foreignId('tour_instance_id')->nullable()->after('tour_id')->constrained('tour_instances')->onDelete('cascade');
            }
            // Giữ tour_id tạm thời để backward compatibility
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trip_assignments', function (Blueprint $table) {
            $table->dropForeign(['tour_instance_id']);
            $table->dropColumn('tour_instance_id');
        });
    }
};
