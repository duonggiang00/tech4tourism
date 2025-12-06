<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'services';

    protected $fillable = [
        'service_type_id',
        'provider_id',
        'name',
        'description',
        'type_room',
        'type_car',
        'type_meal',
        'unit',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'limit' => 'integer',
    ];

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function tourService()
    {
        return $this->hasMany(TourService::class);
    }

    public function serviceAttributes()
    {
        return $this->hasMany(ServiceAttribute::class, 'service_id');
    }
    public function tourServices()
    {
        return $this->hasMany(\App\Models\TourService::class, 'service_id');
    }
}
