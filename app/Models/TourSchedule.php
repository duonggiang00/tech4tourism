<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourSchedule extends Model
{
    //
    /** @use HasFactory<\Database\Factories\TourScheduleFactory> */
    use HasFactory;
    protected $fillable = [
        'tour_id',      // <--- QUAN TRỌNG: Phải có dòng này mới dùng được hàm create()
        'name',
        'description',
        'date',
        'breakfast',
        'lunch',
        'dinner',
    ];
}
