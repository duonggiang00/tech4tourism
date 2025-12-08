<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'tour_id', // Giữ để backward compatibility
        'tour_instance_id', // Mới: thuộc TourInstance
        'user_id',
        'client_name',
        'client_phone',
        'client_email',
        'count_adult',
        'count_children',
        'final_price',
        'discount_amount', // Số tiền giảm giá
        'discount_percent', // Phần trăm giảm giá
        'status',
    ];

    // Quan hệ: 1 Booking có nhiều Hành khách
    public function passengers()
    {
        return $this->hasMany(Passenger::class);
    }

    // Quan hệ: 1 Booking có nhiều Lần thanh toán
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Quan hệ: Booking thuộc về 1 TourInstance (mới)
    public function tourInstance()
    {
        return $this->belongsTo(TourInstance::class, 'tour_instance_id');
    }

    // Quan hệ: Booking thuộc về 1 Tour (backward compatibility)
    public function tour()
    {
        // Nếu có tour_instance_id, lấy tour từ instance
        if ($this->tour_instance_id) {
            return $this->belongsTo(Tour::class, 'tour_id')->orWhereHas('instances', function ($q) {
                $q->where('id', $this->tour_instance_id);
            });
        }
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    // Helper: Lấy tour template từ instance
    public function getTourTemplateAttribute()
    {
        if ($this->tourInstance) {
            return $this->tourInstance->tourTemplate;
        }
        // Fallback: nếu vẫn dùng tour_id cũ
        return $this->tour;
    }

    /**
     * Tính số tiền còn nợ (từ payments)
     */
    public function getLeftPaymentAttribute()
    {
        $totalPaid = $this->payments()
            ->where('status', 1) // Chỉ tính thanh toán thành công
            ->sum('amount');

        return max(0, $this->final_price - $totalPaid);
    }

    /**
     * Tính tổng đã thanh toán
     */
    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->where('status', 1)
            ->sum('amount');
    }
}