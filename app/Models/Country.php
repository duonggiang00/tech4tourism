<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    //
    protected $fillable = [
        'name',
        'code',
        'description',
    ];
    
    public function provinces(){
        return $this->hasMany(Province::class);
    }


}
