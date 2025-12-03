<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cho phép mọi user đã đăng nhập thực hiện (hoặc check role admin ở đây)
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'status' => 'required|in:0,1,2,3', // 0: Chờ, 1: Hoạt động, 2: Hoàn thành, 3: Hủy
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Vui lòng chọn hướng dẫn viên.',
            'user_id.exists' => 'Hướng dẫn viên không tồn tại.',
            'status.required' => 'Vui lòng chọn trạng thái.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ];
    }
}