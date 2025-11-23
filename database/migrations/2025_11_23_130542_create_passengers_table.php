<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_passengers_table.php
    public function up(): void
    {
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade'); // Liên kết booking

            $table->string('fullname');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            $table->tinyInteger('gender')->nullable()->comment('0:Male, 1:Female');
            $table->date('birth')->nullable();

            $table->tinyInteger('type')->default(0)->comment('0:Adult, 1:Child, 2:Infant');
            $table->text('request')->nullable(); // Yêu cầu đặc biệt (ăn chay, dị ứng...)

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
