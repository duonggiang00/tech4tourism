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

            $table->foreignId('id_service_type')->constrained('service_types')->cascadeOnDelete();
            $table->foreignId('id_provider')->constrained('providers')->cascadeOnDelete();
            // $table->foreignId('id_destination')->nullable()->constrained('destinations')->nullOnDelete();

            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);

            $table->string('type_room', 100)->nullable();
            $table->string('type_car', 100)->nullable();
            $table->string('type_meal', 100)->nullable();

            $table->integer('limit')->nullable();
            $table->string('unit', 50)->nullable();
            $table->string('priceDefault')->nullable();

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
