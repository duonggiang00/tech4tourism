<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    /**
     * Quyền cho phép request (cho phép luôn)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Luật validate cho việc thêm dịch vụ
     */
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
            'id_service_type.required' => 'Vui lòng chọn loại dịch vụ.',
            'id_provider.required' => 'Vui lòng chọn nhà cung cấp.',
            'name.required' => 'Tên dịch vụ là bắt buộc.',
            'price.required' => 'Giá dịch vụ là bắt buộc.',
            'price.numeric' => 'Giá phải là số hợp lệ.',
        ];
    }
}