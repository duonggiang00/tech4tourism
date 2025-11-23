<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_bookings_table.php
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            // Liên kết với Tour Template
            $table->unsignedBigInteger('id_tour_instance');
            $table->foreign('id_tour_instance')->references('id')->on('tour_templates')->onDelete('cascade');

            $table->string('code')->unique(); // Mã Booking (VD: BK-2024-001)

            $table->date('date_start');
            $table->date('date_end');

            // Thông tin người đặt (Contact info)
            $table->string('client_name');
            $table->string('client_phone');
            $table->string('client_email');

            $table->integer('count_adult')->default(1);
            $table->integer('count_children')->default(0);

            $table->decimal('final_price', 12, 2); // Tổng tiền
            $table->decimal('left_payment', 12, 2); // Số tiền còn thiếu

            // 0: Mới đặt, 1: Đã xác nhận/Cọc, 2: Hoàn thành, 3: Hủy
            $table->tinyInteger('status')->default(0)->comment('0:Pending, 1:Confirmed, 2:Completed, 3:Cancelled');

            $table->timestamps();
            $table->softDeletes(); // deleted_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
