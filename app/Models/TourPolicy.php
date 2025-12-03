<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourPolicy extends Model
{
    /** @use HasFactory<\Database\Factories\TourPolicyFactory> */
    use HasFactory;
    protected $fillable = [
        'policy_id',
        'tour_id'
    ];

    public function tour(){
        return $this->belongsTo(Tour::class);
    }

    public function policy(){
        return $this->belongsTo(Policy::class);
    }
}
