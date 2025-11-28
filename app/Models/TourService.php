<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourService extends Model
{
    /** @use HasFactory<\Database\Factories\TourServiceFactory> */
    use HasFactory;
    protected $fillable = [
        'tour_id',
        'service_id',
        'quantity',
        'unit',
        'price_unit',
        'price_total',
        'description',
    ];
    public function tour(){
        return $this->belongsTo(Tour::class);
    }

    public function service(){
        return $this->belongsTo(Service::class);
    }
}
