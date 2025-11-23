<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
            //
            'title'=>['required','string','max:255'],
            'description'=>['nullable','string'],
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Tiêu đề danh mục không được bỏ trống',
            'title.max' => 'Tiêu đề không quá 255 ký tự',
        ];
    }
}
