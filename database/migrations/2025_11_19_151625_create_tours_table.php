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
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id');
            $table->foreignId('province_id');

            $table->string('title', 255);
            $table->enum('status',[0,1,2,3]);// 0: đã hủy, 1: sắp có, 2: đang diễn ra, 3: đã hoàn thành
            $table->integer('day');
            $table->integer('night');
            $table->date('date_start')->nullable();
            $table->date('date_end')->nullable();
            $table->integer('limit')->nullable();
            
            $table->string('thumbnail', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('short_description',500)->nullable();
            $table->decimal('price_adult', 12, 2)->nullable();
            $table->decimal('price_children', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
