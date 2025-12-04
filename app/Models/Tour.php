<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Thêm soft deletes nếu bảng có deleted_at
use Illuminate\Support\Facades\Storage;

class Tour extends Model
{
    /** @use HasFactory<\Database\Factories\TourFactory> */
    use HasFactory; // Kích hoạt SoftDeletes

    /**
     * Các trường được phép gán giá trị (Mass Assignment)
     */
    protected $fillable = [
        'category_id',
        'province_id',
        'user_id',
        'title',
        'status',
        'day',
        'night',
        'date_start',     // Mới
        'date_end',       // Mới
        'limit',          // Mới
        'thumbnail',
        'description',
        'short_description',
        'price_adult',
        'price_children'
    ];

    /**
     * Relationships
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // MỚI: Liên kết với địa điểm
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    // MỚI: Liên kết với người tạo (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(TourImages::class);
    }

    public function tourServices()
    {
        return $this->hasMany(TourService::class);
    }

    public function schedules()
    {
        return $this->hasMany(TourSchedule::class);
    }

    public function tourPolicies()
    {
        return $this->hasMany(TourPolicy::class);
    }

    public function tripAssignments()
    {
        return $this->hasMany(TripAssignment::class);
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    protected function thumbnail(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? Storage::url($value) : null,
        );
    }
}
