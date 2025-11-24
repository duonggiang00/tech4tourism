<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Employees;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employees>
 */
class EmployeesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Employees::class;
    public function definition(): array
    {
        $departmentId = Department::inRandomOrder()->first()->id;
        return [
            //
            'name'=>fake()->sentence(2),
            'avatar'=>fake()->imageUrl(100,100,'person',true),
            'email'=>fake()->email(),
            'phone'=>fake()->numberBetween(9000000000, 9999999999),
            'department_id'=>$departmentId,
            'position'=>fake()->sentence(2),
            'salary'=>fake()->numberBetween(1000000,9999999),
        ];
    }
}
