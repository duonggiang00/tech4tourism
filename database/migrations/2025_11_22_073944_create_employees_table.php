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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(false);
            $table->string('avatar')->nullable(true);
            $table->string('email')->unique()->nullable(false);
            $table->string('phone')->nullable(false);
            $table->foreignId('department_id');
            $table->string('position')->nullable(false);
            $table->decimal('salary', 12, 2)->nullable(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
