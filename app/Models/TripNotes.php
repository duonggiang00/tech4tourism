<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripNotes extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_assignment_id',
        'title',
        'content',
    ];

    public function tripAssignment()
    {
        return $this->belongsTo(TripAssignment::class);
    }
}
