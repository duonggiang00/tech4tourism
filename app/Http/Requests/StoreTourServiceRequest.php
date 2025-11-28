<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Đặt thành true để cho phép user thực hiện request này
        // Bạn có thể thêm logic phân quyền (Policy) tại đây nếu cần
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
            'service_id' => [
                'required',
                'integer',
                'exists:services,id' // Phải tồn tại trong bảng services master
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1' // Số lượng tối thiểu là 1
            ],
            'unit' => [
                'required',
                'string',
                'max:50' // Khớp với độ dài trong migration
            ],
            'price_unit' => [
                'required',
                'numeric',
                'min:0' // Giá không được âm
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000' // Giới hạn độ dài nếu cần
            ],
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi (Optional)
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Vui lòng chọn một dịch vụ.',
            'service_id.exists' => 'Dịch vụ đã chọn không tồn tại trong hệ thống.',
            'quantity.required' => 'Vui lòng nhập số lượng.',
            'quantity.min' => 'Số lượng phải lớn hơn 0.',
            'unit.required' => 'Vui lòng nhập đơn vị tính.',
            'unit.max' => 'Đơn vị tính không được vượt quá 50 ký tự.',
            'price_unit.required' => 'Vui lòng nhập đơn giá.',
            'price_unit.min' => 'Đơn giá không được nhỏ hơn 0.',
        ];
    }
}