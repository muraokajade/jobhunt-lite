import type { Company, DashBoardSummary } from "../types/company";

// SummaryCardsコンポーネントが親コンポーネントから受け取るpropsの型。
// companiesは保険用、dashboardSummaryがあればAPI集計値を優先して表示する。
type SummaryCardsProps = {
  companies: Company[];
  dashboardSummary?: DashBoardSummary;
};

// 企業一覧データから、指定した選考状況に一致する件数を数える関数。
// dashboardSummaryがまだ取得できていない場合のfallbackとして使う。
function countByStatus(companies: Company[], status: string) {
  return companies.filter((company) => company.status === status).length;
}

// 応募企業の集計カードを表示するコンポーネント。
// API通信は行わず、親から受け取ったdashboardSummaryまたはcompaniesをもとに件数を表示する。
function SummaryCards({ companies, dashboardSummary }: SummaryCardsProps) {
  const total = dashboardSummary?.total ?? companies.length;

  const interview =
    dashboardSummary?.interview ?? countByStatus(companies, "面談予定");

  const waiting =
    dashboardSummary?.waiting ?? countByStatus(companies, "面談後返答待ち");

  const offer = dashboardSummary?.offer ?? countByStatus(companies, "内定");

  const rejected =
    dashboardSummary?.rejected ?? countByStatus(companies, "落選");

  return (
    <section className="mt-6 rounded-lg border bg-slate-50 p-4">
      <h2 className="mb-4 text-xl font-bold">応募状況サマリー</h2>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">応募総数</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm text-blue-700">面談予定</p>
          <p className="text-2xl font-bold text-blue-900">{interview}</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-700">返答待ち</p>
          <p className="text-2xl font-bold text-amber-900">{waiting}</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-sm text-emerald-700">内定</p>
          <p className="text-2xl font-bold text-emerald-900">{offer}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <p className="text-sm text-slate-600">落選</p>
          <p className="text-2xl font-bold text-slate-800">{rejected}</p>
        </div>
      </div>
    </section>
  );
}

export default SummaryCards;
