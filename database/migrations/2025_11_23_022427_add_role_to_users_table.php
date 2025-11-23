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
        Schema::table('users', function (Blueprint $table) {
            // Thêm cột role, mặc định là 0 (Khách hàng/User thường)
            // 1: Admin, 2: HDV, 3: Sale
            $table->tinyInteger('role')->default(0)->after('email')->comment('0:Customer, 1:Admin, 2:Guide, 3:Sale');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
