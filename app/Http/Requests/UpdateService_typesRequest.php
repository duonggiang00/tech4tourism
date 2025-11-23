<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateService_typesRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'name' => 'required|string|max:100|unique:service_types,name',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ];
    }
    public function messages(): array
    {
        return [
            'name.required' => 'Tên loại dịch vụ là bắt buộc.',
            'name.unique' => 'Tên loại dịch vụ này đã tồn tại.',
        ];
    }
}
