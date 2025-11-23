<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // Liên kết với bảng tours
            $table->foreignId('id_tour_instance')
                ->constrained('tours')
                ->cascadeOnDelete();

            $table->string('code')->unique(); // Mã Booking (VD: BK-2024-001)
            $table->date('date_start');
            $table->date('date_end');

            // Thông tin người đặt
            $table->string('client_name');
            $table->string('client_phone');
            $table->string('client_email');

            $table->integer('count_adult')->default(1);
            $table->integer('count_children')->default(0);

            $table->decimal('final_price', 12, 2);
            $table->decimal('left_payment', 12, 2)->default(0);

            $table->tinyInteger('status')->default(0)
                ->comment('0: Pending, 1: Confirmed, 2: Completed, 3: Cancelled');

            $table->timestamps();
            $table->softDeletes();
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
