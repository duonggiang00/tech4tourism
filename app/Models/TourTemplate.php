<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class TourTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tour_templates';

    protected $fillable = [
        'category_id',
        'province_id',
        'user_id',
        'title',
        'day',
        'night',
        'thumbnail',
        'description',
        'short_description',
        'price_adult',
        'price_children',
    ];

    protected $casts = [
        'price_adult' => 'decimal:2',
        'price_children' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(TourImages::class, 'tour_id'); // Giữ tour_id để tương thích
    }

    public function tourServices()
    {
        return $this->hasMany(TourService::class, 'tour_id');
    }

    public function schedules()
    {
        return $this->hasMany(TourSchedule::class, 'tour_id');
    }

    public function tourPolicies()
    {
        return $this->hasMany(TourPolicy::class, 'tour_id');
    }

    public function instances()
    {
        return $this->hasMany(TourInstance::class, 'tour_template_id');
    }

    protected function thumbnail(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? Storage::url($value) : null,
        );
    }
}
