<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourInstance extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tour_instances';

    protected $fillable = [
        'tour_template_id',
        'date_start',
        'date_end',
        'limit',
        'booked_count',
        'price_adult',
        'price_children',
        'status',
    ];

    protected $casts = [
        'date_start' => 'date',
        'date_end' => 'date',
        'price_adult' => 'decimal:2',
        'price_children' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function tourTemplate()
    {
        return $this->belongsTo(TourTemplate::class, 'tour_template_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'tour_instance_id');
    }

    public function tripAssignments()
    {
        return $this->hasMany(TripAssignment::class, 'tour_instance_id');
    }

    /**
     * Helper methods
     */
    public function getAvailableSlotsAttribute()
    {
        if (!$this->limit) {
            return null; // Không giới hạn
        }
        return max(0, $this->limit - $this->booked_count);
    }

    public function isFull()
    {
        if (!$this->limit) {
            return false;
        }
        return $this->booked_count >= $this->limit;
    }

    /**
     * Lấy giá người lớn: ưu tiên giá instance, nếu null thì dùng giá template
     */
    public function getEffectivePriceAdultAttribute()
    {
        return $this->price_adult ?? $this->tourTemplate->price_adult ?? null;
    }

    /**
     * Lấy giá trẻ em: ưu tiên giá instance, nếu null thì dùng giá template
     */
    public function getEffectivePriceChildrenAttribute()
    {
        return $this->price_children ?? $this->tourTemplate->price_children ?? null;
    }

    /**
     * Alias để tương thích với code cũ
     */
    public function tour()
    {
        return $this->tourTemplate();
    }
}
