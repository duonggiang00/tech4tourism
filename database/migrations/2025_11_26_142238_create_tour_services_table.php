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
        Schema::create('tour_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id');
            $table->foreignId('service_id');
            $table->integer('quantity')->default(1);
            $table->string('unit',50);
            $table->decimal('price_unit', 12, 2);
            $table->decimal('price_total', 12, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_services');
    }
};
