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
        'id_destination',
        'name',
        'description',
        'email',
        'hotline',
        'address',
        'website',
        'status',
        'notes',
    ];

    // public function destination()
    // {
    //     return $this->belongsTo(Destinations::class, 'id_destination');
    // }
}
