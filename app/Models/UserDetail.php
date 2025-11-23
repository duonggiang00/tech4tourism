<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'gender',
        'avatar',
        'phone',
        'address',
        'experience',
        'language',
        'tour_complete',
        'status',
    ];

    // Tự động chuyển JSON trong DB thành Array khi lấy ra và ngược lại
    protected $casts = [
        'language' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

