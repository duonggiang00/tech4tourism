<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTourPolicyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Cho phép đổi loại chính sách hoặc chỉ đổi nội dung tùy nghiệp vụ
            'policy_id' => ['sometimes', 'exists:policies,id'],
            'content' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'policy_id.exists' => 'Chính sách không tồn tại.',
        ];
    }
}