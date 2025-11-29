<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Tour extends Model
{
    /** @use HasFactory<\Database\Factories\TourFactory> */
    use HasFactory;

    /**
     * Các trường được phép gán giá trị (Mass Assignment)
     * Khắc phục lỗi: Field '...' doesn't have a default value
     */
    protected $fillable = [
        'category_id',
        'title',
        'status',
        'day',
        'night',
        'thumbnail',
        'description',
        'short_description',
        'price_adult',
        'price_children'
    ];

    /**
     * Định nghĩa quan hệ với bảng Categories
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images(){
        return $this->hasMany(TourImages::class);
    }

    public function tourServices(){
        return $this->hasMany(TourService::class);
    }

    public function schedules(){
        return $this->hasMany(TourSchedule::class);
    }

    public function tourPolicies(){
        return $this->hasMany(TourPolicy::class);
    }
    protected function thumbnail(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? Storage::url($value) : null,
        );
    }
}