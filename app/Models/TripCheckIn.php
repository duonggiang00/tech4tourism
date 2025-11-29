<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripCheckIn extends Model
{
    /** @use HasFactory<\Database\Factories\TripCheckInFactory> */
    use HasFactory;
    public function tripAssignment()
    {
        return $this->belongsTo(TripAssignment::class, 'trip_assignment_id');
    }

    public function checkInDetails()
    {
        return $this->hasMany(CheckInDetail::class, 'trip_check_in_id');
    }
}
