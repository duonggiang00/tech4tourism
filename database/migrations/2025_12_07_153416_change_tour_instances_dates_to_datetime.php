<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tour_instances', function (Blueprint $table) {
            $table->dateTime('date_start')->change();
            $table->dateTime('date_end')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_instances', function (Blueprint $table) {
            $table->date('date_start')->change();
            $table->date('date_end')->change();
        });
    }
};
