# セクションまとめ：Company CRUD 完了メモ

## 概要

JobHunt Lite の企業管理機能として、Company の CRUD を一通り実装した。

CRUD は以下の4つ。

- Create：企業登録
- Read：企業一覧表示
- Update：企業情報更新
- Delete：企業削除

今回の実装では、Laravel API と React 画面を連携させて、企業データを登録・表示・編集・削除できる状態まで作成した。

重複してもよいので、あとから見返したときに「どの処理が何をしているか」「どこで Laravel API に飛んでいるか」「React 側でどの state を使っているか」が分かるように整理する。

---

# 1. 全体の処理イメージ

## React と Laravel の役割

React 側は画面と操作を担当する。

Laravel 側は API と DB 処理を担当する。

処理の流れは以下。

    Reactでボタンを押す
    ↓
    fetchでLaravel APIへリクエストを送る
    ↓
    LaravelのControllerが処理する
    ↓
    DBに登録・取得・更新・削除する
    ↓
    LaravelからJSONを返す
    ↓
    Reactが受け取って画面を更新する

---

# 2. API_BASE_URL

React 側では、Laravel API のURLを定数化している。

    const API_BASE_URL = "http://127.0.0.1:8001/api";

これにより、各API呼び出しでは以下のように書ける。

    fetch(`${API_BASE_URL}/companies`)

企業1件に対する操作では、id をURLに含める。

    fetch(`${API_BASE_URL}/companies/${company.id}`)

---

# 3. Read：企業一覧表示

## 目的

Laravel API から企業一覧を取得して、React の companies state に保存する。

その companies を map で回して、テーブルに表示する。

## React 側の state

    const [companies, setCompanies] = useState<Company[]>([]);

companies は企業一覧データを持つ配列。

初期値は空配列。

## fetchCompanies

    async function fetchCompanies() {
      const response = await fetch(`${API_BASE_URL}/companies`);
      const json = await response.json();

      const data = json.data;
      setCompanies(data);
    }

## 意味

    GET /api/companies
    ↓
    Laravel 側の index メソッドが動く
    ↓
    企業一覧が JSON で返る
    ↓
    json.data を取り出す
    ↓
    setCompanies(data) で一覧 state に保存
    ↓
    画面に一覧表示される

## useEffect で初回取得

    useEffect(() => {
      fetchCompanies();
    }, []);

画面を開いた直後に1回だけ企業一覧を取得する。

空配列 [] を指定しているので、初回レンダリング時だけ実行される。

## 一覧表示

    {companies.map((company) => (
      <tr key={company.id}>
        <td>{company.name}</td>
        <td>{company.media ?? "-"}</td>
        <td>{company.priority ?? "-"}</td>
        <td>{company.status ?? "-"}</td>
      </tr>
    ))}

companies 配列を map で回して、1企業ごとに table row を作る。

---

# 4. Create：企業登録

## 目的

入力フォームの内容を Laravel API に送信して、企業を新規登録する。

## form state

    const [form, setForm] = useState<CompanyForm>({
      name: "",
      media: "",
      priority: "3.0",
      status: "応募済み",
      job_url: "",
      applied_date: getToday(),
      memo: "",
    });

form は企業登録フォームの入力値を管理する state。

## getToday

    function getToday() {
      return new Date().toISOString().slice(0, 10);
    }

今日の日付を yyyy-MM-dd 形式で取得する関数。

input type="date" の初期値や応募日に使う。

## createCompany

    const createCompany = async () => {
      try {
        setIsSubmitting(true);

        const requestBody = {
          ...form,
          name: form.name,
          media: form.media,
          priority: form.priority,
          status: "応募済み",
          job_url: form.job_url,
          applied_date: getToday(),
          memo: form.memo,
        };

        const response = await fetch(`${API_BASE_URL}/companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("企業登録に失敗しました。");
        }

        const json = await response.json();
        const createdCompany = json.data;

        setCompanies((prevCompanies) => [...prevCompanies, createdCompany]);

        setForm({
          name: "",
          media: "",
          status: "",
          priority: "中",
          job_url: "",
          memo: "",
          applied_date: getToday(),
        });

        alert("企業を登録しました。");

        fetchCompanies();
      } catch (e) {
        console.error(e);
        alert("企業登録に失敗しました。");
      } finally {
        setIsSubmitting(false);
      }
    };

## 意味

    登録ボタンを押す
    ↓
    createCompany が実行される
    ↓
    form の内容から requestBody を作る
    ↓
    POST /api/companies に送信
    ↓
    Laravel の store メソッドが動く
    ↓
    DBに企業が登録される
    ↓
    登録された企業データが JSON で返る
    ↓
    React側の companies に追加
    ↓
    フォームを初期化
    ↓
    fetchCompanies() で一覧を再取得

## 二重送信防止

    const [isSubmitting, setIsSubmitting] = useState(false);

登録処理中かどうかを管理する。

登録開始時に true にする。

    setIsSubmitting(true);

処理完了後に false に戻す。

    setIsSubmitting(false);

ボタンでは以下のように使う。

    <button
      type="button"
      onClick={createCompany}
      disabled={isSubmitting}
    >
      {isSubmitting ? "登録中..." : "登録する"}
    </button>

これにより、登録中に何度もボタンを押されることを防ぐ。

---

# 5. 詳細モーダル

## 目的

一覧の詳細ボタンを押した企業を selectedCompany に保存し、その企業の情報を editForm に詰めて、編集モーダルを開く。

## モーダル関連 state

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

isModalOpen はモーダルが開いているかどうか。

selectedCompany は現在選択中の企業。

## editForm state

    const [editForm, setEditForm] = useState<CompanyEditForm>({
      name: "",
      media: "",
      priority: "3.0",
      status: "応募済み",
      applied_date: "",
      interview_date: "",
      job_url: "",
      interview_url: "",
      next_action: "",
      document_result: "未対応",
      first_interview_result: "未対応",
      second_interview_result: "未対応",
      final_result: "未対応",
      rejection_stage: "未設定",
      memo: "",
    });

editForm は編集用フォームの入力値を管理する state。

登録用の form とは別で管理する。

理由は、登録フォームと編集フォームでは役割が違うから。

## handleOpenModal

    function handleOpenModal(company: Company) {
      setSelectedCompany(company);

      setEditForm({
        name: company.name,
        media: company.media ?? "",
        priority: company.priority ?? "3.0",
        status: company.status,
        applied_date: company.appliedDate ?? "",
        interview_date: company.interviewDate ?? "",
        job_url: company.jobUrl ?? "",
        interview_url: company.interviewUrl ?? "",
        next_action: company.nextAction ?? "",
        document_result: company.documentResult ?? "未対応",
        first_interview_result: company.firstInterviewResult ?? "未対応",
        second_interview_result: company.secondInterviewResult ?? "未対応",
        final_result: company.finalResult ?? "未対応",
        rejection_stage: company.rejectionStage ?? "未設定",
        memo: company.memo ?? "",
      });

      setIsModalOpen(true);
    }

## 意味

    詳細ボタンを押す
    ↓
    handleOpenModal(company) が実行される
    ↓
    押した行の company が渡される
    ↓
    selectedCompany に保存
    ↓
    editForm に現在の企業情報を詰める
    ↓
    モーダルを開く

## 詳細ボタン

    <button
      type="button"
      onClick={() => handleOpenModal(company)}
      className="rounded bg-slate-700 px-3 py-1 text-white"
    >
      詳細
    </button>

onClick の中で company を渡すのが重要。

    onClick={() => handleOpenModal(company)}

これにより、「どの企業の詳細を開くか」が分かる。

## handleCloseModal

    function handleCloseModal() {
      setIsModalOpen(false);
      setSelectedCompany(null);
    }

モーダルを閉じて、選択中の企業情報もリセットする。

---

# 6. Update：企業情報更新

## 目的

モーダル内で編集した editForm の内容を Laravel API に送信し、企業情報を更新する。

## handleUpdateCompany

    const handleUpdateCompany = async () => {
      if (!selectedCompany) return;

      try {
        const response = await fetch(`${API_BASE_URL}/companies/${selectedCompany.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(editForm),
        });

        if (!response.ok) {
          throw new Error("情報更新に失敗しました。");
        }

        await fetchCompanies();

        handleCloseModal();
      } catch (e) {
        console.error(e);
      }
    };

## 意味

    更新ボタンを押す
    ↓
    handleUpdateCompany が実行される
    ↓
    selectedCompany.id を使って更新対象を指定
    ↓
    editForm の内容を JSON にして送信
    ↓
    PUT /api/companies/{id}
    ↓
    Laravel の update メソッドが動く
    ↓
    DBが更新される
    ↓
    fetchCompanies() で一覧を再取得
    ↓
    handleCloseModal() でモーダルを閉じる

## 更新ボタン

    <button
      type="button"
      onClick={handleUpdateCompany}
      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
    >
      更新
    </button>

更新ボタンはモーダル内に置く。

selectedCompany が存在している状態で押される前提。

## Laravel Controller 側の update

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return new CompanyResource($company);
    }

## 意味

    UpdateCompanyRequest でバリデーション
    ↓
    validated() で通過した値だけ取得
    ↓
    $company->update($validated) で更新
    ↓
    CompanyResource でレスポンス整形
    ↓
    React に返す

## validate と validated の違い

Controller に直接バリデーションルールを書く場合は validate() を使う。

    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
    ]);

FormRequest にルールを分離した場合は validated() を使う。

    $validated = $request->validated();

UpdateCompanyRequest を使っている場合は、Controller 側では validated() が正解。

---

# 7. Delete：企業削除

## 目的

一覧の削除ボタンを押した企業を Laravel API に送信し、DBから削除する。

## 最初に詰まったポイント

一覧の削除ボタンは、詳細ボタンとは関係ない。

詳細ボタンを押したときだけ selectedCompany がセットされる。

つまり、一覧上の削除ボタンで以下のように書いていると、selectedCompany が null のままなので処理が止まる。

    const handleDelete = async () => {
      if (!selectedCompany) return;
    };

この場合、詳細モーダルを開いていないので selectedCompany が存在しない。

そのため、一覧の削除では selectedCompany を使うのではなく、押した行の company を直接渡す必要がある。

## 修正後の handleDelete

    const handleDelete = async (company: Company) => {
      const isConfirmed = window.confirm(`${company.name} を削除しますか？`);

      if (!isConfirmed) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("企業削除に失敗しました。");
        }

        alert("企業を削除しました。");

        await fetchCompanies();
      } catch (e) {
        console.error(e);
        alert("企業削除に失敗しました。");
      }
    };

## 削除ボタン

    <button
      type="button"
      onClick={() => handleDelete(company)}
      className="rounded bg-red-600 px-3 py-1 mt-2 text-white hover:bg-red-700"
    >
      削除
    </button>

ここが重要。

    onClick={() => handleDelete(company)}

このようにすることで、押した行の企業データを削除処理に渡せる。

## 意味

    一覧の削除ボタンを押す
    ↓
    onClick={() => handleDelete(company)}
    ↓
    押した行の company が handleDelete に渡る
    ↓
    company.id を使って DELETE リクエストを送る
    ↓
    DELETE /api/companies/{id}
    ↓
    Laravel の destroy メソッドが動く
    ↓
    DBから企業が削除される
    ↓
    fetchCompanies() で一覧を再取得する
    ↓
    画面から削除済み企業が消える

## window.confirm

    const isConfirmed = window.confirm(`${company.name} を削除しますか？`);

削除前に確認ダイアログを出す。

OKなら true。

キャンセルなら false。

キャンセルされた場合は return で処理を止める。

    if (!isConfirmed) {
      return;
    }

## Laravel Controller 側の destroy

    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([
            'message' => '企業を削除しました。'
        ]);
    }

## 意味

    DELETE /api/companies/{company}
    ↓
    ルートモデルバインディングで Company を取得
    ↓
    $company->delete() で削除
    ↓
    JSONで成功メッセージを返す

Laravel 側の destroy はこれでOK。

今回削除できなかった原因は、Laravel側ではなく、React側で削除対象の company を渡していなかったこと。

---

# 8. Laravel API Resource

## 目的

Laravel から React に返すレスポンスの形を整える。

## Resource 作成コマンド

    php artisan make:resource CompanyResource

作成場所。

    app/Http/Resources/CompanyResource.php

## Controller での使い方

1件返す場合。

    return new CompanyResource($company);

一覧で返す場合。

    return CompanyResource::collection($companies);

## update で使った形

    return new CompanyResource($company);

DB更新後の企業情報を、CompanyResource で整形して返している。

---

# 9. FormRequest

## 目的

バリデーションルールを Controller から分離する。

Controller に長い validate を書くより、StoreCompanyRequest や UpdateCompanyRequest に分けたほうが見通しがよい。

## 作成コマンド

登録用。

    php artisan make:request StoreCompanyRequest

更新用。

    php artisan make:request UpdateCompanyRequest

## 作成場所

    app/Http/Requests/StoreCompanyRequest.php
    app/Http/Requests/UpdateCompanyRequest.php

## authorize

FormRequest を作ったら、まず authorize を true にする。

    public function authorize(): bool
    {
        return true;
    }

これを true にしないと、権限エラーでリクエストが通らない。

## rules

更新用では PUT/PATCH の仕様に応じて考える。

全体更新なら required を使う項目があってもよい。

部分更新なら sometimes を使う。

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'media' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
            'applied_date' => ['nullable', 'date'],
            'interview_date' => ['nullable', 'date'],
            'job_url' => ['nullable', 'string'],
            'interview_url' => ['nullable', 'string'],
            'memo' => ['nullable', 'string'],
            'next_action' => ['nullable', 'string', 'max:255'],
            'document_result' => ['nullable', 'string', 'max:255'],
            'first_interview_result' => ['nullable', 'string', 'max:255'],
            'second_interview_result' => ['nullable', 'string', 'max:255'],
            'final_result' => ['nullable', 'string', 'max:255'],
            'rejection_stage' => ['nullable', 'string', 'max:255'],
        ];
    }

## Controller 側

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return new CompanyResource($company);
    }

FormRequest を使う場合、Controller では validate() ではなく validated() を使う。

---

# 10. ルートモデルバインディング

## 目的

Laravel が URL の {company} から自動で Company モデルを取得してくれる仕組み。

## 例

    public function update(UpdateCompanyRequest $request, Company $company)

    public function destroy(Company $company)

この Company $company は、URL の id から Laravel が自動で取得してくれる。

例えば以下のリクエストなら、

    PUT /api/companies/5

Laravel は id=5 の Company を探して、$company に入れてくれる。

削除も同じ。

    DELETE /api/companies/5

Laravel は id=5 の Company を探して、destroy の $company に渡してくれる。

## 重要

React 側で正しい id を送る必要がある。

    fetch(`${API_BASE_URL}/companies/${company.id}`)

または更新なら、

    fetch(`${API_BASE_URL}/companies/${selectedCompany.id}`)

---

# 11. 今回の重要な詰まりポイント

## 1. Resource と Request の混同

最初に CompanyResource と UpdateCompanyRequest が混ざった。

Resource はレスポンス整形。

Request はバリデーション。

役割が違う。

    CompanyResource
    → LaravelからReactに返すデータの形を整える

    UpdateCompanyRequest
    → ReactからLaravelに来た入力値を検証する

## 2. validate と validated の違い

Controller に直接 rules を書く場合は validate()。

FormRequest を使う場合は validated()。

    $request->validate([...])
    → Controller内で直接バリデーションする

    $request->validated()
    → FormRequestで検証済みの値を取得する

## 3. 更新時は selectedCompany を使う

更新は詳細モーダル内で行う。

詳細ボタンを押すと selectedCompany がセットされる。

そのため更新では selectedCompany.id を使える。

    fetch(`${API_BASE_URL}/companies/${selectedCompany.id}`)

## 4. 一覧削除では selectedCompany を使わない

一覧の削除ボタンは詳細モーダルを開いていない。

そのため selectedCompany が null のまま。

一覧削除では、map 内の company を直接渡す。

    onClick={() => handleDelete(company)}

## 5. 削除確認は confirm ではなく window.confirm を実行する

間違い。

    if (!confirm) {
      return;
    }

これは confirm 関数自体を見ているだけ。

正しい形。

    const isConfirmed = window.confirm("この企業を削除しますか？");

    if (!isConfirmed) {
      return;
    }

## 6. 削除後は fetchCompanies が必要

DBから削除されても、Reactの画面は自動では変わらない。

削除後に一覧を再取得する。

    await fetchCompanies();

これで画面上からも削除済み企業が消える。

## 7. 更新後も fetchCompanies が必要

DBを更新しても、一覧表示は自動更新されない。

更新後も一覧を再取得する。

    await fetchCompanies();

---

# 12. CRUDごとのAPI対応表

## Create

React。

    POST /api/companies

Laravel。

    store

主な処理。

    企業登録
    バリデーション
    DB保存
    登録済みデータを返す

## Read

React。

    GET /api/companies

Laravel。

    index

主な処理。

    企業一覧取得
    CompanyResource::collection で返す
    Reactで一覧表示

## Update

React。

    PUT /api/companies/{id}

Laravel。

    update

主な処理。

    UpdateCompanyRequestでバリデーション
    $company->update($validated)
    CompanyResourceで返す
    Reactで一覧再取得

## Delete

React。

    DELETE /api/companies/{id}

Laravel。

    destroy

主な処理。

    $company->delete()
    JSONでメッセージ返却
    Reactで一覧再取得

---

# 13. React側の最終的な重要コードまとめ

## 一覧取得

    async function fetchCompanies() {
      const response = await fetch(`${API_BASE_URL}/companies`);
      const json = await response.json();

      const data = json.data;
      setCompanies(data);
    }

## 登録

    const createCompany = async () => {
      try {
        setIsSubmitting(true);

        const requestBody = {
          ...form,
          name: form.name,
          media: form.media,
          priority: form.priority,
          status: "応募済み",
          job_url: form.job_url,
          applied_date: getToday(),
          memo: form.memo,
        };

        const response = await fetch(`${API_BASE_URL}/companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("企業登録に失敗しました。");
        }

        await fetchCompanies();

        setForm({
          name: "",
          media: "",
          status: "",
          priority: "3.0",
          job_url: "",
          memo: "",
          applied_date: getToday(),
        });

        alert("企業を登録しました。");
      } catch (e) {
        console.error(e);
        alert("企業登録に失敗しました。");
      } finally {
        setIsSubmitting(false);
      }
    };

## 詳細モーダルを開く

    function handleOpenModal(company: Company) {
      setSelectedCompany(company);

      setEditForm({
        name: company.name,
        media: company.media ?? "",
        priority: company.priority ?? "3.0",
        status: company.status,
        applied_date: company.appliedDate ?? "",
        interview_date: company.interviewDate ?? "",
        job_url: company.jobUrl ?? "",
        interview_url: company.interviewUrl ?? "",
        next_action: company.nextAction ?? "",
        document_result: company.documentResult ?? "未対応",
        first_interview_result: company.firstInterviewResult ?? "未対応",
        second_interview_result: company.secondInterviewResult ?? "未対応",
        final_result: company.finalResult ?? "未対応",
        rejection_stage: company.rejectionStage ?? "未設定",
        memo: company.memo ?? "",
      });

      setIsModalOpen(true);
    }

## モーダルを閉じる

    function handleCloseModal() {
      setIsModalOpen(false);
      setSelectedCompany(null);
    }

## 更新

    const handleUpdateCompany = async () => {
      if (!selectedCompany) return;

      try {
        const response = await fetch(`${API_BASE_URL}/companies/${selectedCompany.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(editForm),
        });

        if (!response.ok) {
          throw new Error("情報更新に失敗しました。");
        }

        await fetchCompanies();

        handleCloseModal();
      } catch (e) {
        console.error(e);
      }
    };

## 削除

    const handleDelete = async (company: Company) => {
      const isConfirmed = window.confirm(`${company.name} を削除しますか？`);

      if (!isConfirmed) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("企業削除に失敗しました。");
        }

        alert("企業を削除しました。");

        await fetchCompanies();
      } catch (e) {
        console.error(e);
        alert("企業削除に失敗しました。");
      }
    };

---

# 14. Laravel側の最終的な重要コードまとめ

## store

    public function store(StoreCompanyRequest $request)
    {
        $validated = $request->validated();

        $company = Company::create($validated);

        return new CompanyResource($company);
    }

## index

    public function index()
    {
        $companies = Company::latest()->get();

        return CompanyResource::collection($companies);
    }

## update

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return new CompanyResource($company);
    }

## destroy

    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([
            'message' => '企業を削除しました。'
        ]);
    }

---

# 15. CRUD完成時点の到達点

今回の時点で、JobHunt Lite の Company CRUD は一通り完了。

できることは以下。

    企業を登録できる
    企業一覧を表示できる
    企業詳細モーダルを開ける
    企業情報を編集できる
    編集後に一覧を更新できる
    企業を削除できる
    削除後に一覧を更新できる

この状態で、Laravel API と React UI の基本連携はかなり実戦的な形になった。

---

# 16. 今後の拡張候補

## 1. 削除後にモーダルを閉じる

一覧削除では不要だが、モーダル内に削除ボタンを置く場合は削除後に handleCloseModal() を呼ぶ。

    await fetchCompanies();
    handleCloseModal();

## 2. エラーメッセージを画面表示にする

現在は alert や console.error が中心。

今後は state で errorMessage を管理して、画面上に表示するとよい。

## 3. 成功メッセージを toast にする

alert は簡単だが、UIとしては少し強い。

将来的には toast 表示にすると自然。

## 4. 削除後に state だけで即時反映する

fetchCompanies() ではなく、React側の state から削除済み企業だけ除外する方法もある。

    setCompanies((prevCompanies) =>
      prevCompanies.filter((item) => item.id !== company.id)
    );

ただし、今は fetchCompanies() のほうがDBと画面の整合性を取りやすい。

## 5. PATCH にする

現在は PUT で更新している。

部分更新が中心なら PATCH にしてもよい。

    method: "PATCH"

Laravel 側の route と Controller は対応させる必要がある。

---

# 17. 学習メモ

## CRUDは単なる4機能ではない

CRUDは、

    登録
    表示
    更新
    削除

だけではなく、以下の理解も含む。

    React state
    fetch
    HTTP method
    Laravel route
    Controller
    FormRequest
    Resource
    Model
    DB
    画面更新
    エラー処理

今回の実装では、この一連の流れを実際に手を動かして確認できた。

## 特に重要な理解

    更新は selectedCompany を使う
    一覧削除は company を直接渡す
    FormRequest を使うなら validated()
    Resource は返却データの整形
    Request は入力値の検証
    DB更新後・削除後は画面更新が必要
    fetchCompanies() は画面とDBの同期役

---

# 18. まとめ

Company CRUD は完了。

今回のポイントは、Laravel単体ではなく、ReactとLaravelをつないで実際に画面から操作できる状態にしたこと。

特に重要だったのは以下。

    一覧取得は GET
    登録は POST
    更新は PUT
    削除は DELETE
    更新は selectedCompany.id
    一覧削除は handleDelete(company)
    FormRequest では validated()
    Resource では response を整形
    更新後・削除後は fetchCompanies()

このCRUDができると、JobHunt Lite の土台はかなり固くなる。

ここから先は、検索・フィルター・ステータス管理・いいね機能・認証・Google Calendar連携などに広げられる。

ただし、CRUDが終わった時点で、Laravel API × React の基本的な実装力としては大きな一区切り。

ここまでで、JobHunt Lite の中心機能の最低ラインは突破。
