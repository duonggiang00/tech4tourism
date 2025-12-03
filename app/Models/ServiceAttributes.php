<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceAttributes extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'service_attributes';

    protected $fillable = [
        'id_service',
        'name',
        'value',
        'type',
    ];

    public function service()
    {
        return $this->belongsTo(Services::class, 'id_service');
    }
}
