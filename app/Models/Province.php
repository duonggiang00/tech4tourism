<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    /** @use HasFactory<\Database\Factories\ProvincesFactory> */
    use HasFactory;
    protected $fillable = [
        'country_id',
        'name',
        'description',
    ];

    public function destinations()
    {
        return $this->hasMany(Destination::class);
    }

    public function tours()
    {
        return $this->hasMany(Tour::class);
    }
    public function providers()
    {
        return $this->hasMany(Provider::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }


}
