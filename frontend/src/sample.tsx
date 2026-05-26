import { useEffect, useState } from "react";

type Company = {
  id: number;
  name: string;
  media: string | null;
  priority: string | null;
  status: string;
  applied_date: string | null;
  interview_date: string | null;
  next_action: string | null;
  document_result: string | null;
  first_interview_result: string | null;
  memo: string | null;
  is_favorite: boolean;
};

type CompanyForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  applied_date: string;
  memo: string;
};

const API_URL = "http://127.0.0.1:8000/api/companies";

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [form, setForm] = useState<CompanyForm>({
    name: "",
    media: "",
    priority: "3.0 普通",
    status: "応募済み",
    applied_date: "",
    memo: "",
  });

  const fetchCompanies = async () => {
    const res = await fetch(API_URL);
    const json = await res.json();

    setCompanies(json);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      media: "",
      priority: "3.0 普通",
      status: "応募済み",
      applied_date: "",
      memo: "",
    });

    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-bold text-slate-500">転職活動CRM</p>
            <h1 className="text-2xl font-bold">JobHunt</h1>
          </div>

          <nav className="flex gap-6 text-sm font-bold">
            <span>応募管理</span>
            <span>Dashboard</span>
            <span>検討リスト</span>
            <span>設定</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <section className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400">JOBHUNT LITE</p>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">応募を管理する</h2>
              <p className="mt-2 text-sm text-slate-600">
                企業登録・検索・選考状況更新・詳細編集を一画面で行います。
              </p>
            </div>

            <button className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-bold text-white">
              登録
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-5 gap-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">応募総数</p>
            <p className="mt-2 text-2xl font-bold">{companies.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">面談予定</p>
            <p className="mt-2 text-2xl font-bold">
              {companies.filter((company) => company.interview_date).length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">返答待ち</p>
            <p className="mt-2 text-2xl font-bold">
              {companies.filter((company) => company.status === "応募済み").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">内定</p>
            <p className="mt-2 text-2xl font-bold">
              {companies.filter((company) => company.status === "内定").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">落選</p>
            <p className="mt-2 text-2xl font-bold">
              {companies.filter((company) => company.status === "落選").length}
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">企業登録</h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="企業名"
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <input
              name="media"
              value={form.media}
              onChange={handleChange}
              placeholder="媒体"
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="3.0 普通">3.0 普通</option>
              <option value="4.0 高い">4.0 高い</option>
              <option value="5.0 最優先">5.0 最優先</option>
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="応募済み">応募済み</option>
              <option value="書類通過">書類通過</option>
              <option value="面接予定">面接予定</option>
              <option value="内定">内定</option>
              <option value="落選">落選</option>
            </select>

            <input
              name="applied_date"
              value={form.applied_date}
              onChange={handleChange}
              type="date"
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <textarea
              name="memo"
              value={form.memo}
              onChange={handleChange}
              placeholder="メモ"
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <button className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-bold text-white">
              登録する
            </button>
          </form>
        </section>

        <section className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-lg font-bold">企業一覧</h3>
              <p className="text-sm text-slate-500">
                登録済み企業の選考状況・志望度・次アクションを確認できます。
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
              {companies.length}件
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">企業名</th>
                  <th className="px-4 py-3 text-left">媒体</th>
                  <th className="px-4 py-3 text-left">志望度</th>
                  <th className="px-4 py-3 text-left">状況</th>
                  <th className="px-4 py-3 text-left">応募日</th>
                  <th className="px-4 py-3 text-left">面談日</th>
                  <th className="px-4 py-3 text-left">次アクション</th>
                  <th className="px-4 py-3 text-left">書類</th>
                  <th className="px-4 py-3 text-left">1次</th>
                  <th className="px-4 py-3 text-left">メモ</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className={company.is_favorite ? "bg-amber-50" : "bg-white"}
                  >
                    <td className="border-b px-4 py-3 font-bold">
                      <span className="mr-2">{company.is_favorite ? "♥" : "♡"}</span>
                      {company.name}
                    </td>
                    <td className="border-b px-4 py-3">{company.media ?? "-"}</td>
                    <td className="border-b px-4 py-3">{company.priority ?? "-"}</td>
                    <td className="border-b px-4 py-3">{company.status}</td>
                    <td className="border-b px-4 py-3">
                      {company.applied_date ?? "-"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {company.interview_date ?? "-"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {company.next_action ?? "-"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {company.document_result ?? "未対応"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {company.first_interview_result ?? "未対応"}
                    </td>
                    <td className="border-b px-4 py-3">{company.memo ?? "-"}</td>
                    <td className="border-b px-4 py-3">
                      <button className="rounded bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;