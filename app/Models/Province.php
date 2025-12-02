<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    use HasFactory;

    /**
     * Các thuộc tính có thể gán hàng loạt.
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        "country_id",
        'description',
    ];

    /**
     * Lấy Quốc gia (Country) mà Tỉnh (Province) này thuộc về.
     */
    public function country(): BelongsTo
    {
        // Khóa ngoại mặc định là 'country_id'
        return $this->belongsTo(Country::class);
    }

    /**
     * Lấy tất cả các Điểm đến (Destination) thuộc về Tỉnh (Province) này.
     */
    public function destinations(): HasMany
    {
        return $this->hasMany(Destination::class);
    }
}