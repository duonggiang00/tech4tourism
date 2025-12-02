<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Destination extends Model
{
    /** @use HasFactory<\Database\Factories\DestinationFactory> */
    use HasFactory;

    /**
     * Các thuộc tính có thể gán hàng loạt.
     * @var array<int, string>
     */
    protected $fillable = [
        "name",
        "province_id",
        "address",
        "status",
        "description",
        "category_id" // Giả sử Destination có category_id
    ];

    /**
     * Lấy Tỉnh (Province) mà Điểm đến (Destination) này thuộc về.
     */
    public function province(): BelongsTo
    {
        // Khóa ngoại mặc định là 'province_id'
        return $this->belongsTo(Province::class);
    }

    /**
     * Lấy Danh mục (Category) của Điểm đến (Destination) này.
     */
    public function category(): BelongsTo
    {
        // Cần đảm bảo mô hình Category tồn tại và có khóa ngoại 'category_id'
        return $this->belongsTo(Category::class);
    }
}