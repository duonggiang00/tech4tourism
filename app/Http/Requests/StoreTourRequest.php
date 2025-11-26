<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourRequest extends FormRequest
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
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id'
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                'unique:tours,title',
            ],
            'status' => [
                'required',
                'integer',
                'in:0,1,2' 
            ],
            'day' => [
                'required',
                'integer',
                'min:0'
            ],
            'night' => [
                'required',
                'integer',
                'min:0'
            ],
            'thumbnail' => [
                'nullable', // Database cho phép null
                'image',
                'mimes:jpeg,png,jpg,gif,svg',
                'max:2048' // Tối đa 2MB
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'short_description' => [
                'nullable',
                'string',
                'max:500'
            ],
            'price_adult' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999999.99'
            ],
            'price_children' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999999.99'
            ],
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi tiếng Việt
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Vui lòng chọn danh mục tour.',
            'category_id.exists' => 'Danh mục đã chọn không tồn tại.',

            'title.required' => 'Tên tour không được để trống.',
            'title.max' => 'Tên tour không được vượt quá 255 ký tự.',
            'title.unique' => 'Tên tour này đã tồn tại.',

            'status.required' => 'Vui lòng chọn trạng thái.',
            'status.in' => 'Trạng thái không hợp lệ.',

            'day.required' => 'Số ngày không được để trống.',
            'day.integer' => 'Số ngày phải là số nguyên.',
            'day.min' => 'Số ngày không được nhỏ hơn 0.',

            'night.required' => 'Số đêm không được để trống.',
            'night.integer' => 'Số đêm phải là số nguyên.',
            'night.min' => 'Số đêm không được nhỏ hơn 0.',

            'thumbnail.image' => 'File tải lên phải là hình ảnh.',
            'thumbnail.mimes' => 'Ảnh phải có định dạng: jpeg, png, jpg, gif, svg.',
            'thumbnail.max' => 'Dung lượng ảnh không được vượt quá 2MB.',

            'short_description.max' => 'Mô tả ngắn không được vượt quá 500 ký tự.',

            'price_adult.numeric' => 'Giá người lớn phải là dạng số.',
            'price_adult.min' => 'Giá người lớn không được âm.',

            'price_children.numeric' => 'Giá trẻ em phải là dạng số.',
            'price_children.min' => 'Giá trẻ em không được âm.',
        ];
    }
}