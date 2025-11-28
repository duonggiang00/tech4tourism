<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTourServiceRequest extends FormRequest
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
            // Khi update, ta thường không validate service_id vì id này thường bị disable ở frontend
            // Tuy nhiên, nếu bạn muốn cho phép đổi, hãy uncomment dòng dưới:
            'service_id' => [
                'required',
                'integer',
                'exists:services,id'
            ],

            'quantity' => [
                'required',
                'integer',
                'min:1'
            ],
            'unit' => [
                'required',
                'string',
                'max:50'
            ],
            'price_unit' => [
                'required',
                'numeric',
                'min:0'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Vui lòng nhập số lượng.',
            'quantity.min' => 'Số lượng phải lớn hơn 0.',
            'unit.required' => 'Vui lòng nhập đơn vị tính.',
            'price_unit.required' => 'Vui lòng nhập đơn giá.',
        ];
    }
}