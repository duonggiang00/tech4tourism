<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Services extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'services';

    protected $fillable = [
        'id_service_type',
        'id_provider',
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
        return $this->belongsTo(ServiceTypes::class, 'id_service_type');
    }

    public function provider()
    {
        return $this->belongsTo(Providers::class, 'id_provider');
    }

    public function attributes()
    {
        return $this->hasMany(ServiceAttributes::class, 'id_service');
    }
}
