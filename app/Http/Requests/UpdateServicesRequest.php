<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServicesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_service_type' => 'required|exists:service_types,id',
            'id_provider' => 'required|exists:providers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'type_room' => 'nullable|string|max:100',
            'type_car' => 'nullable|string|max:100',
            'type_meal' => 'nullable|string|max:100',
            'limit' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'priceDefault' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'id_service_type.required' => 'Loại dịch vụ không được để trống.',
            'id_provider.required' => 'Nhà cung cấp không được để trống.',
            'name.required' => 'Tên dịch vụ là bắt buộc.',
            'price.required' => 'Giá dịch vụ là bắt buộc.',
            'price.numeric' => 'Giá phải là số hợp lệ.',
        ];
    }
}