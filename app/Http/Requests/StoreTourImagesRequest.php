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
            'image' => [
                'required', 
                'image',    
                'mimes:jpeg,png,jpg,gif,webp', 
                'max:5120'  
            ],
            'alt' => [
                'nullable',
                'string',
                'max:255'
            ],
            'order' => [
                'nullable',
                'integer',
                'min:0'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Vui lòng chọn một hình ảnh.',
            'image.image' => 'File tải lên phải là hình ảnh.',
            'image.mimes' => 'Định dạng ảnh không hợp lệ (chỉ chấp nhận jpeg, png, jpg, gif, webp).',
            'image.max' => 'Kích thước ảnh không được vượt quá 5MB.',
            'order.integer' => 'Thứ tự hiển thị phải là số nguyên.',
        ];
    }
}