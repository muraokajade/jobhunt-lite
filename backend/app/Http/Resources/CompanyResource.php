<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// 企業データをフロントエンド向けに整形するResource
class CompanyResource extends JsonResource
{
    /**
     * 企業データをAPIレスポンス用に変換する
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'media' => $this->media,
            'priority' => $this->priority,
            'status' => $this->status,
            'appliedDate' => $this->applied_date,
            'interviewDate' => $this->interview_date,
            'jobUrl' => $this->job_url,
            'interviewUrl' => $this->interview_url,
            'memo' => $this->memo,
            'nextAction' => $this->next_action,
            'documentResult' => $this->document_result,
            'firstInterviewResult' => $this->first_interview_result,
            'secondInterviewResult' => $this->second_interview_result,
            'finalResult' => $this->final_result,
            'rejectionStage' => $this->rejection_stage,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
