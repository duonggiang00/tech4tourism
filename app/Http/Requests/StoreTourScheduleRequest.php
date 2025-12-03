<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourScheduleRequest extends FormRequest
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
            'destination_id' => [
                'required',
                'integer',
                'exists:destinations,id'
            ],
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'date' => 'required|integer|min:1',
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi
     */
    public function messages(): array
    {
        return [
            'destination_id.required' => 'Vui lòng chọn địa điểm cho lịch trình.',
            'destination_id.integer' => 'Mã địa điểm phải là số nguyên.',
            'destination_id.exists' => 'Địa điểm đã chọn không tồn tại trong hệ thống.',

            'name.required' => 'Tên hoạt động không được để trống.',
            'name.string' => 'Tên hoạt động phải là chuỗi ký tự.',
            'name.max' => 'Tên hoạt động không được vượt quá 200 ký tự.',

            'description.string' => 'Mô tả phải là chuỗi ký tự.',

            'date.required' => 'Vui lòng nhập ngày thứ mấy (VD: Ngày 1, Ngày 2).',
            'date.integer' => 'Ngày phải là một số nguyên.',
            'date.min' => 'Ngày phải lớn hơn hoặc bằng 1.',

        ];
    }
}