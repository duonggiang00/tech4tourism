<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id', // Khóa ngoại
        'amount',     // Số tiền
        'method',     // 0: Tiền mặt, 1: Chuyển khoản...
        'status',     // 1: Thành công, 0: Thất bại...
        'date',       // Ngày thanh toán
        'thumbnail',  // Ảnh biên lai
    ];

    // Tự động ép kiểu dữ liệu
    protected $casts = [
        'date' => 'datetime', // Chuyển thành object Carbon (có cả giờ phút)
        'amount' => 'decimal:2',
        'method' => 'integer',
        'status' => 'integer',
    ];

    // Quan hệ ngược: Thanh toán thuộc về 1 Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
