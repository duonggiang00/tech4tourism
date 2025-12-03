<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourSchedule extends Model
{
    //
    /** @use HasFactory<\Database\Factories\TourScheduleFactory> */
    use HasFactory;
    protected $fillable = [
        'tour_id',     
        'destination_id',
        'name',
        'description',
        'date',
    ];
    public function tour(){
        return $this->belongsTo(Tour::class);
    }

    public function destination(){
        return $this->belongsTo(Destination::class);
    }
}
