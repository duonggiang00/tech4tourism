<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Provider extends Model
{
    /** @use HasFactory<\Database\Factories\ProvidersFactory> */
    use HasFactory, SoftDeletes;
    protected $table = "providers";
    protected $fillable = [
        'province_id',
        'name',
        'description',
        'email',
        'hotline',
        'address',
        'website',
        'status',
        'notes',
    ];

    public function province()
    {
        return $this->belongsTo(Province::class, );
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
