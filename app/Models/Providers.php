<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Providers extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'providers';

    protected $fillable = [
        'name',
        'description',
        'email',
        'hotline',
        'address',
        'website',
        'status',
        'notes',
    ];

    public function services()
    {
        return $this->hasMany(Services::class, 'id_provider');
    }
}
