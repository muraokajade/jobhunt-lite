<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class CompanyDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $companies = Company::where('user_id', Auth::id())->get();

        $interviewCompanies = $companies->filter(function ($company) {
            return $company->status === '面談予定'
                || $company->interview_date !== null;
        });

        $waitingCompanies = $companies->filter(function ($company) {
            return in_array($company->status, [
                '応募済み',
                '書類選考待ち',
                '面談日程調整中',
                '面談後返答待ち',
            ]);
        });

        $highPriorityCompanies = $companies->filter(function ($company) {
            return ((float) $company->priority >= 4.0);
        });

        return response()->json([
            'summary' => [
                'total' => $companies->count(),
                'interview' => $interviewCompanies->count(),
                'waiting' => $waitingCompanies->count(),
                'offer' => $companies->where('status', '内定')->count(),
                'rejected' => $companies->where('status', '落選')->count(),
                'highPriority' => $highPriorityCompanies->count(),
            ],
            'actionLists' => [
                'interviews' => CompanyResource::collection(
                    $interviewCompanies
                        ->sortBy('interview_date')
                        ->take(3)
                        ->values()
                )->resolve(),

                'waiting' => CompanyResource::collection(
                    $waitingCompanies
                        ->sortBy('applied_date')
                        ->take(3)
                        ->values()
                )->resolve(),

                'highPriority' => CompanyResource::collection(
                    $highPriorityCompanies
                        ->sortByDesc('priority')
                        ->take(3)
                        ->values()
                )->resolve(),
            ],

        ]);

    }
    
}