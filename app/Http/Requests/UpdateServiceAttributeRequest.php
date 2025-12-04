<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'name'       => 'required|string|max:100',
            'value'      => 'nullable|string|max:200',
            'type'       => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.required' => 'Vui lòng chọn dịch vụ.',
            'service_id.exists'   => 'Dịch vụ được chọn không tồn tại.',

            'name.required'       => 'Tên thuộc tính không được để trống.',
            'name.string'         => 'Tên thuộc tính phải là chuỗi ký tự.',
            'name.max'            => 'Tên thuộc tính không được vượt quá 100 ký tự.',

            'value.string'        => 'Giá trị thuộc tính phải là chuỗi ký tự.',
            'value.max'           => 'Giá trị thuộc tính không được vượt quá 200 ký tự.',

            'type.string'         => 'Loại thuộc tính phải là chuỗi ký tự.',
            'type.max'            => 'Loại thuộc tính không được vượt quá 50 ký tự.',
        ];
    }
}
