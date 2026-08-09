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
  isFavorite: boolean;
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
  job_url: string;
  applied_date: string;
  memo: string;
};
// 詳細モーダル用フォームの入力値を表す型。
// 既存企業の現在データをinput / select / textareaに入れて表示するために使う。
// この時点ではPUT更新はまだ行わない。
export type CompanyEditForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  applied_date: string;
  interview_date: string;
  job_url: string;
  interview_url: string;
  next_action: string;
  document_result: string;
  first_interview_result: string;
  second_interview_result: string;
  final_result: string;
  rejection_stage: string;
  memo: string;
};

//徐々出しがいいか
export type CompanyTableProps = {
  companies: Company[];
  loading: boolean;
  priorityOptions: Option[];
  statusOptions: string[];
  onOpenModal: (company: Company) => void;
  onDelete: (company: Company) => void;
  onPriorityChange: (company: Company, priority: string) => void;
  onStatusChange: (company: Company, status: string) => void;
  onToggleFavorite: (company: Company) => void;
};

// value / label形式のselect選択肢で使う共通型。
// priorityOptionsやrejectionStageOptionsなどで利用する。

export type Option = {
  value: string;
  label: string;
};

export type DashBoardSummary = {
  total: number;
  interview: number;
  waiting: number;
  offer: number;
  rejected: number;
  highPriority: number;
};

// Dashboardの「次に確認する企業」で使う企業リストの型。
// Laravelの /api/companies/dashboard の actionLists に対応する。
export type DashboardActionLists = {
  interviews: Company[];
  waiting: Company[];
  highPriority: Company[];
};

export type ActionListsProps = {
  companies: Company[];
  dashboardActionLists?: DashboardActionLists;
  onOpenDetail: (company: Company) => void;
};
export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};
