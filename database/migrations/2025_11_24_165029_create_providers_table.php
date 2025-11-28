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
        Schema::create('providers', function (Blueprint $table) {
            $table->id();

            // $table->foreignId('id_destination')->nullable()->constrained('destinations')->nullOnDelete();

            $table->string('name', 200);
            $table->string('description', 200)->nullable();
            $table->string('email', 200)->nullable();
            $table->string('hotline', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('website', 255)->nullable();

            $table->enum('status', ['0', '1', '2'])->default('1');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
