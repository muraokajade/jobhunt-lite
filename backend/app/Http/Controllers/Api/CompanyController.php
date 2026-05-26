<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use App\Http\Requests\StoreCompanyRequest;

class CompanyController extends Controller
{
    /**
     * 企業一覧を取得する
     */
    public function index(): JsonResponse
    {
        $companies = Company::latest()->get();

        return response()->json($companies);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        // $validated = $request->validate([
        //     'name' => ['required', 'string', 'max:255'],
        //     'media' => ['nullable', 'string', 'max:255'],
        //     'priority' => ['nullable', 'string', 'max:255'],
        //     'status' => ['nullable', 'string', 'max:255'],
        //     'applied_date' => ['nullable', 'date'],
        //     'memo' => ['nullable', 'string'],
        // ]);

        $validated = $request->validated();

        $company = Company::create($validated);

        return response()->json($company, 201); //確認方法
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'media' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
            'applied_date' => ['nullable', 'date'],
            'interview_date' => ['nullable', 'date'],
            'job_url' => ['nullable', 'string'],
            'interview_url' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
            'next_action' => ['nullable', 'string', 'max:255'],
            'document_result' => ['nullable', 'string', 'max:255'],
            'first_interview_result' => ['nullable', 'string', 'max:255'],
            'second_interview_result' => ['nullable', 'string', 'max:255'],
            'final_result' => ['nullable', 'string', 'max:255'],
            'rejection_stage' => ['nullable', 'string', 'max:255'],
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([
            'message' => '企業を削除しました。'
        ]);
    }
}
