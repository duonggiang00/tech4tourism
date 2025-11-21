<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourImages extends Model
{
    /** @use HasFactory<\Database\Factories\TourImagesFactory> */
    use HasFactory;

    protected $fillable = [
        'id_tour',
        'img_url',
        'alt',
        'order'
    ];
}
