import type { Company } from "../types/company";

// Company をそのまま Laravel API に送れる形へ変換する関数です。

// フロント側の appliedDate / jobUrl みたいな camelCase を、Laravel側の applied_date / job_url みたいな snake_case に直しています。

// さらに overrides を使うことで、元の会社データをベースにしつつ、priority や status など変更したい項目だけ上書きできます。
export function buildCompanyRequestBody(
  company: Company,
  overrides: Partial<{
    name: string | null;
    media: string | null;
    priority: string | null;
    status: string;
    applied_date: string | null;
    interview_date: string | null;
    job_url: string | null;
    interview_url: string | null;
    memo: string | null;
    next_action: string | null;
    document_result: string | null;
    first_interview_result: string | null;
    second_interview_result: string | null;
    final_result: string | null;
    rejection_stage: string | null;
  }> = {},
) {
  return {
    name: company.name,
    media: company.media,
    priority: company.priority,
    status: company.status,
    applied_date: company.appliedDate,
    interview_date: company.interviewDate,
    job_url: company.jobUrl,
    interview_url: company.interviewUrl,
    memo: company.memo,
    next_action: company.nextAction,
    document_result: company.documentResult,
    first_interview_result: company.firstInterviewResult,
    second_interview_result: company.secondInterviewResult,
    final_result: company.finalResult,
    rejection_stage: company.rejectionStage,
    ...overrides,
  };
}
