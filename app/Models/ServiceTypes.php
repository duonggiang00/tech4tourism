<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceTypes extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'service_types';

    protected $fillable = [
        'name',
        'icon',
        'description',
        'order',
    ];

    public function services()
    {
        return $this->hasMany(Services::class, 'id_service_type');
    }
}
