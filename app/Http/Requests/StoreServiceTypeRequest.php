<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceTypeRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Các quy tắc xác thực áp dụng cho request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:service_types,name',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'iconFile' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi (nếu muốn).
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên loại dịch vụ là bắt buộc.',
            'name.unique' => 'Tên loại dịch vụ này đã tồn tại.',
            'iconFile.image' => 'Tệp tải lên phải là hình ảnh.',
            'iconFile.max' => 'Kích thước ảnh không được vượt quá 2MB.',
        ];
    }
}
