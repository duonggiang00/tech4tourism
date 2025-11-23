<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Passenger extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id', // Quan trọng: Khóa ngoại để liên kết
        'fullname',
        'phone',
        'email',
        'gender',     // 0: Male, 1: Female
        'birth',
        'type',       // 0: Adult, 1: Child, 2: Infant
        'request',    // Yêu cầu đặc biệt
    ];

    // Tự động ép kiểu dữ liệu
    protected $casts = [
        'birth' => 'date',   // Chuyển string date trong DB thành object Carbon
        'gender' => 'integer',
        'type' => 'integer',
    ];

    // Quan hệ ngược: Hành khách thuộc về 1 Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}