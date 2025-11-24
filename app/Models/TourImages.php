<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourImages extends Model
{
    /** @use HasFactory<\Database\Factories\TourImagesFactory> */
    use HasFactory;
    protected $fillable = [
        'tour_id',
        'img_url',
        'alt',
        'order',
    ];
}
