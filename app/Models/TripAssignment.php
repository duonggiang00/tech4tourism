<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\TripAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'tour_id', // Giữ để backward compatibility
        'tour_instance_id', // Mới: thuộc TourInstance
        'user_id',
        'status'
    ];

    /**
     * Quan hệ với TourInstance (mới)
     */
    public function tourInstance()
    {
        return $this->belongsTo(TourInstance::class, 'tour_instance_id');
    }

    /**
     * Định nghĩa quan hệ: Chuyến đi thuộc về một Tour (backward compatibility)
     * Lưu ý: Nếu có tour_instance_id, cần load tourInstance.tourTemplate thay vì dùng relationship này
     */
    public function tour()
    {
        // Backward compatibility: trả về TourTemplate nếu có tour_id
        // Nếu tour_id trỏ đến TourTemplate (sau migration), dùng TourTemplate
        // Nếu không, dùng Tour cũ
        $tourTemplate = \App\Models\TourTemplate::find($this->tour_id);
        if ($tourTemplate) {
            return $this->belongsTo(\App\Models\TourTemplate::class, 'tour_id');
        }
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    /**
     * Quan hệ với User (Hướng dẫn viên)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với các đợt điểm danh (TripCheckIn)
     */
    public function tripCheckIns()
    {
        return $this->hasMany(TripCheckIn::class);
    }

    /**
     * Quan hệ với ghi chú (TripNote)
     */
    public function tripNotes()
    {
        return $this->hasMany(TripNotes::class);
    }
}