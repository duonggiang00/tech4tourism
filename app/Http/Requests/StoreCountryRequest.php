<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCountryRequest extends FormRequest
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
            'name'=>['required','string','max:100'],
            'code'=>['required','string','max:4','unique:countries,code'],
            'description'=>['nullable','string'],
        ];
    }
    public function messages()
    {
        return [
            'name.required' => 'Tên quốc gia là bắt buộc',
            'name.max' => 'Tên quốc gia không quá 100 ký tự',
            'code.required' => 'Mã quốc gia là bắt buộc',
            'code.max' => 'Tên quốc gia không quá 4 ký tự',
            'code.unique' => 'mã quốc gia là duy nhất',
        ];
    }
}
