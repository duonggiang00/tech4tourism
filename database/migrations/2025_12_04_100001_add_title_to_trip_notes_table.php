<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trip_notes', function (Blueprint $table) {
            if (!Schema::hasColumn('trip_notes', 'title')) {
                $table->string('title')->nullable()->after('trip_assignment_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('trip_notes', function (Blueprint $table) {
            if (Schema::hasColumn('trip_notes', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};

