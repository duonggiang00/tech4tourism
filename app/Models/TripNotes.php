<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripNotes extends Model
{
    /** @use HasFactory<\Database\Factories\TripNotesFactory> */
    use HasFactory;
    public function tripAssignment(){
        return $this->belongsTo(TripAssignment::class);
    }
}
