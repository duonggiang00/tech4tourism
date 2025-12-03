<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\HasOne;


class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active'
    ];

    public function detail(): HasOne
    {
        return $this->hasOne(UserDetail::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }



    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }



    /**
     * Kiểm tra user có phải Admin không
     */
    public function isAdmin(): bool
    {
        return $this->role == 1;
    }

    /**
     * Kiểm tra user có phải Hướng dẫn viên không
     */
    public function isGuide(): bool
    {
        return $this->role == 2;
    }

    /**
     * Kiểm tra user có phải Nhân viên Sale không
     */
    public function isSale(): bool
    {
        return $this->role == 3;
    }

    /**
     * Kiểm tra user có phải Khách hàng không
     */
    public function isCustomer(): bool
    {
        return $this->role == 0;
    }

    /**
     * Kiểm tra user có quyền quản lý user không (Admin)
     */
    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }
    
}
