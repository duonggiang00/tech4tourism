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
        Schema::create('service_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_service')->constrained('services')->onDelete('cascade');
            $table->string('name', 100);
            $table->string('value', 200)->nullable();
            $table->string('type', 50)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_attributes');
    }
};