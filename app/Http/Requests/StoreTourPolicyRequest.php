<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPolicyRequest extends FormRequest
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
            'policy_id' => ['required', 'exists:policies,id'], // Phải là ID của một chính sách có sẵn
            'content' => ['nullable', 'string'], // Nội dung ghi đè (nếu có)
        ];
    }

    public function messages(): array
    {
        return [
            'policy_id.required' => 'Vui lòng chọn một chính sách.',
            'policy_id.exists' => 'Chính sách không tồn tại.',
        ];
    }
}