// Laravel APIから取得する企業情報の型。
// React側ではcamelCaseで統一する。
// Laravel側のsnake_caseはCompanyResourceでcamelCaseへ変換する。
export type Company = {
  id: number;
  name: string;
  media: string | null;
  priority: string | null;
  status: string;
  appliedDate: string | null;
  interviewDate: string | null;
  jobUrl: string | null;
  interviewUrl: string | null;
  memo: string | null;
  nextAction: string | null;
  documentResult: string | null;
  firstInterviewResult: string | null;
  secondInterviewResult: string | null;
  finalResult: string | null;
  rejectionStage: string | null;
  createdAt: string;
  updatedAt: string;
};

// 企業登録フォームの入力値を表す型。
// Laravel APIへ送る値なので、DBカラムに合わせてsnake_caseで管理する。
export type CompanyForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  job_url:string,
  applied_date: string;
  memo: string;
};