<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckInDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_check_in_id',
        'passenger_id',
        'is_present',
        'notes',
    ];

    protected $casts = [
        'is_present' => 'boolean',
    ];

    public function tripCheckIn()
    {
        return $this->belongsTo(TripCheckIn::class, 'trip_check_in_id');
    }

    public function passenger()
    {
        return $this->belongsTo(Passenger::class);
    }
}
