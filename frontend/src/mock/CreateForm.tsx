import { useEffect, useState } from "react";

type Company = {
  id: number;
  user_id: number | null;
  name: string;
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
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

type CompanyForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  applied_date: string;
  job_url: string;
  memo: string;
};

const API_URL = "http://127.0.0.1:8000/api/companies";

const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [form, setForm] = useState<CompanyForm>({
    name: "",
    media: "",
    priority: "3.0 普通",
    status: "応募済み",
    applied_date: getToday(),
    job_url: "",
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      applied_date: getToday(),
      job_url: "",
      memo: "",
    });

    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">JobHunt Lite</h1>

        <p className="mt-2 text-sm text-slate-600">
          Laravel APIから取得した企業一覧を表示します。
        </p>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">企業登録</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="企業名"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
              />

              <input
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="媒体"
                value={form.media}
                onChange={(event) =>
                  setForm({
                    ...form,
                    media: event.target.value,
                  })
                }
              />

              <select
                className="rounded-lg border border-slate-300 px-3 py-2"
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value,
                  })
                }
              >
                <option value="3.0 普通">3.0 普通</option>
                <option value="4.0 高い">4.0 高い</option>
                <option value="5.0 最優先">5.0 最優先</option>
              </select>

              <select
                className="rounded-lg border border-slate-300 px-3 py-2"
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value,
                  })
                }
              >
                <option value="応募済み">応募済み</option>
                <option value="書類通過">書類通過</option>
                <option value="面接予定">面接予定</option>
                <option value="内定">内定</option>
                <option value="落選">落選</option>
              </select>

              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2"
                value={form.applied_date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    applied_date: event.target.value,
                  })
                }
              />

              <input
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="求人URL"
                value={form.job_url}
                onChange={(event) =>
                  setForm({
                    ...form,
                    job_url: event.target.value,
                  })
                }
              />

              <textarea
                className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-3"
                placeholder="メモ"
                value={form.memo}
                onChange={(event) =>
                  setForm({
                    ...form,
                    memo: event.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              登録する
            </button>
          </form>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">企業一覧</h2>
            <p className="text-sm text-slate-500">{companies.length}件</p>
          </div>

          {companies.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              企業データがありません。
            </p>
          ) : (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border px-4 py-2 text-left">企業名</th>
                  <th className="border px-4 py-2 text-left">媒体</th>
                  <th className="border px-4 py-2 text-left">志望度</th>
                  <th className="border px-4 py-2 text-left">状況</th>
                  <th className="border px-4 py-2 text-left">応募日</th>
                  <th className="border px-4 py-2 text-left">求人URL</th>
                  <th className="border px-4 py-2 text-left">メモ</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="border px-4 py-2 font-bold">
                      {company.name}
                    </td>
                    <td className="border px-4 py-2">
                      {company.media ?? "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {company.priority ?? "-"}
                    </td>
                    <td className="border px-4 py-2">{company.status}</td>
                    <td className="border px-4 py-2">
                      {company.applied_date ?? "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {company.job_url ? (
                        <a
                          href={company.job_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          開く
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border px-4 py-2">{company.memo ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;