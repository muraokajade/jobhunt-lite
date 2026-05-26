import { useState } from "react";

const mockCompanies = [
  {
    id: 1,
    name: "サンプル株式会社",
    media: "Green",
    priority: "3.0 普通",
    status: "応募済み",
    applied_date: "2026-05-25",
    memo: "Laravel API確認用の仮データ",
  },
  {
    id: 2,
    name: "テスト株式会社",
    media: "type",
    priority: "4.0 高い",
    status: "書類通過",
    applied_date: "2026-05-26",
    memo: "React一覧表示確認用",
  },
];

function App() {
  const [companies, setCompanies] = useState(mockCompanies);

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">JobHunt Lite</h1>

        <p className="mt-2 text-sm text-slate-600">
          企業一覧の表示確認を行います。
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">企業一覧</h2>
            <p className="text-sm text-slate-500">{companies.length}件</p>
          </div>

          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border px-4 py-2 text-left">企業名</th>
                <th className="border px-4 py-2 text-left">媒体</th>
                <th className="border px-4 py-2 text-left">志望度</th>
                <th className="border px-4 py-2 text-left">状況</th>
                <th className="border px-4 py-2 text-left">応募日</th>
                <th className="border px-4 py-2 text-left">メモ</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="border px-4 py-2 font-bold">{company.name}</td>
                  <td className="border px-4 py-2">{company.media}</td>
                  <td className="border px-4 py-2">{company.priority}</td>
                  <td className="border px-4 py-2">{company.status}</td>
                  <td className="border px-4 py-2">{company.applied_date}</td>
                  <td className="border px-4 py-2">{company.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;