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
        Schema::create('services', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_type_id');
            $table->foreignId('provider_id');

            $table->string('name', 255);
            $table->text('description')->nullable();
            // price đã bị bỏ
            // limit đã bị bỏ

            $table->string('type_room', 100)->nullable();
            $table->string('type_car', 100)->nullable();
            $table->string('type_meal', 100)->nullable();

            $table->string('unit', 50)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
