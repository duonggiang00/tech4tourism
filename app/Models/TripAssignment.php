<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\TripAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'total_passengers',
        'status'
    ];

    /**
     * Định nghĩa quan hệ: Chuyến đi thuộc về một Booking
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Quan hệ với User (Hướng dẫn viên)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với các đợt điểm danh (TripCheckIn)
     */
    public function tripCheckIns()
    {
        return $this->hasMany(TripCheckIn::class);
    }

    /**
     * Quan hệ với ghi chú (TripNote)
     */
    public function tripNotes()
    {
        return $this->hasMany(TripNotes::class);
    }
}