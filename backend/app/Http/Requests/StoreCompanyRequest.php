<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 企業登録時の入力値を検証するRequestクラス。
 */
class StoreCompanyRequest extends FormRequest
{
    /**
     * このリクエストを許可する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 企業登録時のバリデーションルールを返す。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'media' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:255'],
            'job_url' => ['nullable', 'url', 'max:2048'],
            'applied_date' => ['nullable', 'date'],
            'memo' => ['nullable', 'string'],
        ];
    }
}
