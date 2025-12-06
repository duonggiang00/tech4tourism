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
        if (!Schema::hasTable('tour_instances')) {
            // Nếu bảng không tồn tại, tạo lại từ đầu
            Schema::create('tour_instances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tour_template_id')->constrained('tour_templates')->onDelete('cascade');
                
                $table->date('date_start');
                $table->date('date_end');
                $table->integer('limit')->nullable();
                $table->integer('booked_count')->default(0);
                
                $table->decimal('price_adult', 12, 2)->nullable();
                $table->decimal('price_children', 12, 2)->nullable();
                
                $table->enum('status', [0, 1, 2, 3])->default(1);
                
                $table->timestamps();
                $table->softDeletes();
                
                $table->index('tour_template_id');
                $table->index('date_start');
                $table->index('status');
            });
            return;
        }

        // Nếu bảng đã tồn tại, kiểm tra và thêm cột nếu thiếu
        if (!Schema::hasColumn('tour_instances', 'tour_template_id')) {
            Schema::table('tour_instances', function (Blueprint $table) {
                // Kiểm tra xem có cột tour_id không (backward compatibility)
                if (Schema::hasColumn('tour_instances', 'tour_id')) {
                    // Nếu có tour_id, đổi tên thành tour_template_id
                    $table->renameColumn('tour_id', 'tour_template_id');
                } else {
                    // Nếu không có, thêm mới
                    $table->foreignId('tour_template_id')->after('id')->constrained('tour_templates')->onDelete('cascade');
                }
            });
        }

        // Đảm bảo có index cho tour_template_id
        if (Schema::hasColumn('tour_instances', 'tour_template_id')) {
            // Kiểm tra xem đã có foreign key chưa bằng cách thử tạo (sẽ bỏ qua nếu đã có)
            try {
                Schema::table('tour_instances', function (Blueprint $table) {
                    $table->foreign('tour_template_id')
                        ->references('id')
                        ->on('tour_templates')
                        ->onDelete('cascade');
                });
            } catch (\Exception $e) {
                // Foreign key đã tồn tại, bỏ qua
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Không rollback vì đây là migration sửa lỗi
    }
};
