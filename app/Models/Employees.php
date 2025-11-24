<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employees extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeesFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'avatar',
        'string',
        'phone',
        'department_id',
        'position',
        'salary',
    ];
}
