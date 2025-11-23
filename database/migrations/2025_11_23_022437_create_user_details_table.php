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
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            // Liên kết 1-1 với bảng users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->string('full_name')->nullable(); // Tên hiển thị đầy đủ
            $table->tinyInteger('gender')->nullable()->comment('1: Male, 2: Female');
            $table->string('avatar')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address', 500)->nullable();

            // Các trường chuyên môn (Dành cho HDV)
            $table->text('experience')->nullable(); // Kinh nghiệm
            $table->json('language')->nullable(); // Ngôn ngữ (lưu dạng JSON: ["en", "fr"])
            $table->integer('tour_complete')->default(0); // Số tour đã dẫn

            // Trạng thái hoạt động
            $table->tinyInteger('status')->default(1)->comment('0: Inactive, 1: Active, 2: On Tour');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_details');
    }
};
