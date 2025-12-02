<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    /**
     * Các thuộc tính có thể gán hàng loạt (Mass assignable attributes).
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    /**
     * Lấy tất cả các tỉnh (Province) thuộc về Quốc gia (Country) này.
     */
    public function provinces()
    {
        return $this->hasMany(Province::class);
    }
}