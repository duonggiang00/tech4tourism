<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourImagesRequest extends FormRequest
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
            'images' => ['required', 'array', 'min:1'], // Phải là một mảng và có ít nhất 1 phần tử
            'images.*' => [ // Validate từng file trong mảng
                'image',
                'mimes:jpeg,png,jpg,gif,svg,webp',
                'max:5120' // Tối đa 5MB
            ],
            // Với upload nhiều ảnh, thường ta bỏ qua alt/order chi tiết cho từng ảnh ở bước này 
            // hoặc xử lý mảng phức tạp hơn. Ở đây ta tạm bỏ qua để giữ đơn giản theo logic controller.
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'Vui lòng chọn ít nhất một hình ảnh.',
            'images.array' => 'Dữ liệu gửi lên phải là danh sách hình ảnh.',
            'images.min' => 'Vui lòng chọn ít nhất một hình ảnh.',
            'images.*.image' => 'File tải lên phải là hình ảnh.',
            'images.*.mimes' => 'Định dạng ảnh không hợp lệ (chỉ chấp nhận jpeg, png, jpg, gif, svg, webp).',
            'images.*.max' => 'Kích thước ảnh không được vượt quá 5MB.',
        ];
    }
}