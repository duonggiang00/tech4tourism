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
        // Kiểm tra nếu bảng đã tồn tại thì bỏ qua
        if (Schema::hasTable('tour_instances')) {
            return;
        }

        Schema::create('tour_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_template_id')->constrained('tour_templates')->onDelete('cascade');
            
            $table->date('date_start');
            $table->date('date_end');
            $table->integer('limit')->nullable(); // Số chỗ tối đa
            $table->integer('booked_count')->default(0); // Số chỗ đã đặt
            
            $table->decimal('price_adult', 12, 2)->nullable();
            $table->decimal('price_children', 12, 2)->nullable();
            
            $table->enum('status', [0, 1, 2, 3])->default(1)->comment('0: Đã hủy, 1: Sắp có, 2: Đang diễn ra, 3: Đã hoàn thành');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tour_template_id');
            $table->index('date_start');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_instances');
    }
};
