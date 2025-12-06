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
        Schema::table('tour_templates', function (Blueprint $table) {
            $table->decimal('price_adult', 12, 2)->nullable()->after('short_description');
            $table->decimal('price_children', 12, 2)->nullable()->after('price_adult');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_templates', function (Blueprint $table) {
            $table->dropColumn(['price_adult', 'price_children']);
        });
    }
};
