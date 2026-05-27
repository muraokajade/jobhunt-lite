import type { CompanyTableProps, Option } from "../types/company";

function CompanyTable({
  companies,
  loading,
  priorityOptions,
  statusOptions,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onOpenModal,
  onToggleFavorite,
}: CompanyTableProps) {
  return (
    <section className="mt-6">
      <h2 className="mb-4 text-xl font-bold">企業一覧</h2>

      {companies.length === 0 ? (
        <p className="text-slate-500">企業データがありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-900 text-white">
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2">企業名</th>
                <th className="px-3 py-2">媒体</th>
                <th className="px-3 py-2">志望度</th>
                <th className="px-3 py-2">状況</th>
                <th className="px-3 py-2">求人URL</th>
                <th className="px-3 py-2">応募日</th>
                <th className="px-3 py-2">面談日</th>
                <th className="px-3 py-2">メモ</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={10}
                  >
                    読み込み中...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={10}
                  >
                    企業データがありません。
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const isFavorite = company.isFavorite;
                  const isRejected = company.status === "落選";

                  //落選なら、グレーアウトを最優先
                  // 落選でなければ、favoriteならピンク
                  // どちらでもなければ白
                  const rowClassName = `border-b ${
                    isRejected
                      ? "bg-slate-300 text-slate-400"
                      : isFavorite
                        ? "bg-pink-100"
                        : "bg-white"
                  }`;

                  return (
                    <tr key={company.id} className={rowClassName}>
                      <td className="px-4 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(company)}
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                            company.isFavorite
                              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                              : "border-slate-300 bg-white text-slate-400 hover:bg-slate-50",
                          ].join(" ")}
                          aria-label="お気に入り切り替え"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill={company.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                            />
                          </svg>
                        </button>
                      </td>

                      {/* チップ追加 */}

                      {/* <td className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{company.name}</span>
                          {isFavorite && !isRejected && <span>注目</span>}
                          {isRejected && <span>落選</span>}
                        </div>
                      </td> */}
                      {/* チップ追加 */}
                      <td className="px-3 py-2 font-semibold">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isRejected ? "text-slate-500" : "text-slate-900"
                            }
                          >
                            {company.name}
                          </span>

                          {isFavorite && !isRejected && (
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
                              注目
                            </span>
                          )}

                          {isRejected && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              落選
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2">{company.media ?? "-"}</td>

                      <td className="px-3 py-2">
                        <select
                          value={company.priority ?? "3.0"}
                          onChange={(event) =>
                            onPriorityChange(company, event.target.value)
                          }
                          className="rounded border px-2 py-1"
                        >
                          {priorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-2">
                        <select
                          value={company.status ?? "応募済み"}
                          onChange={(event) =>
                            onStatusChange(company, event.target.value)
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-2">{company.jobUrl ?? "-"}</td>
                      <td className="px-3 py-2">
                        {company.appliedDate ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        {company.interviewDate ?? "-"}
                      </td>
                      <td className="px-3 py-2">{company.memo ?? "-"}</td>

                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onOpenModal(company)}
                          className="rounded bg-slate-700 px-3 py-1 text-white"
                        >
                          詳細
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(company)}
                          className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default CompanyTable;
