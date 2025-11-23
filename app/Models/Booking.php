<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'id_tour_instance', 'code', 'date_start', 'date_end',
        'client_name', 'client_phone', 'client_email',
        'count_adult', 'count_children',
        'final_price', 'left_payment', 'status'
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

    // Quan hệ: Booking thuộc về 1 Tour
    public function tour()
    {
        // Vì tên cột khóa ngoại là id_tour_instance (không chuẩn Laravel)
        // nên ta phải khai báo rõ tham số thứ 2
        return $this->belongsTo(Tour::class, 'id_tour_instance'); 
    }
}