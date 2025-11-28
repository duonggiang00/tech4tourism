<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceType extends Model
{
    /** @use HasFactory<\Database\Factories\ServiceTypeFactory> */
    use HasFactory, SoftDeletes;
    protected $table = 'service_types';
    protected $fillable = [
        'name',
        'icon',
        'description',
        'order',
    ];
}
