<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProvidersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_destination' => 'nullable|exists:destinations,id',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:200',
            'email' => 'nullable|email|max:200',
            'hotline' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'status' => 'in:0,1,2',
            'notes' => 'nullable|string',
        ];
    }
}