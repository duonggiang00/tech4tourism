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
        Schema::table('passengers', function (Blueprint $table) {
            // Cột cccd đã tồn tại trong database - bỏ qua nếu đã có
            if (!Schema::hasColumn('passengers', 'cccd')) {
                $table->string('cccd', 20)->nullable()->after('email')->comment('Căn cước công dân');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            $table->dropColumn('cccd');
        });
    }
};
