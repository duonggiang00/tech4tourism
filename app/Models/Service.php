<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    /** @use HasFactory<\Database\Factories\ServicesFactory> */
    use HasFactory, SoftDeletes;
    protected $table = "services";
    protected $fillable = [
        'service_type_id',
        'provider_id',
        'name',
        'description',
        'price',
        'type_room',
        'type_car',
        'type_meal',
        'limit',
        'unit',
        'priceDefault',
    ];
    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function tourService(){
        return $this->hasMany(TourService::class);
    }
}