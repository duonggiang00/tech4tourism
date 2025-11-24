<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_payments_table.php
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');

            $table->decimal('amount', 12, 2); // Số tiền thanh toán lần này

            $table->tinyInteger('method')->comment('0:Cash, 1:Transfer, 2:Card, 3:Gateway');
            $table->tinyInteger('status')->default(1)->comment('0:Failed, 1:Success, 2:Pending');

            $table->dateTime('date');
            $table->string('thumbnail')->nullable(); // Ảnh chụp bill chuyển khoản

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
