<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('passengers', function (Blueprint $table) {
            $table->unsignedBigInteger('booking_id')->nullable();
            // hoặc nếu có bảng bookings
            // $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::table('passengers', function (Blueprint $table) {
            $table->dropColumn('booking_id');
        });
    }
};
