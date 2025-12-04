<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type_id' => 'required|exists:service_types,id',
            'provider_id' => 'required|exists:providers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type_room' => 'nullable|string|max:100',
            'type_car' => 'nullable|string|max:100',
            'type_meal' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'service_type_id.required' => 'Loại dịch vụ không được để trống.',
            'provider_id.required' => 'Nhà cung cấp không được để trống.',
            'name.required' => 'Tên dịch vụ là bắt buộc.',
        ];
    }
}
