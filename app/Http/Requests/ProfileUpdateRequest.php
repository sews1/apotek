<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 
                'string', 
                'max:255',
                'regex:/^[a-zA-Z\s]+$/'
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s\(\)]+$/'
            ],
            'bio' => [
                'nullable',
                'string',
                'max:500'
            ],
            'birth_date' => [
                'nullable',
                'date',
                'before:today'
            ],
            'avatar' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048'
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.string' => 'Nama harus berupa teks.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'name.regex' => 'Nama hanya boleh berisi huruf dan spasi.',
            
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'email.lowercase' => 'Email harus huruf kecil.',
            'email.max' => 'Email maksimal 255 karakter.',
            
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            
            'bio.max' => 'Bio maksimal 500 karakter.',
            
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
            
            'avatar.image' => 'File harus berupa gambar.',
            'avatar.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
            'avatar.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/[^\d+\-\s\(\)]/', '', $this->phone),
            ]);
        }

        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }
    }
}