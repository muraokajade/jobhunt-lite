# JobHunt Lite：CRUD後の次フェーズ実装方針メモ

## 概要

JobHunt Lite は、現時点で基本的な Company CRUD が完了している。

現在できていることは以下。

- 企業登録
- 企業一覧表示
- 企業詳細表示
- 企業情報更新
- 企業削除

ここまでで、Laravel API と React の基本連携は一通り確認できている。

ただし、6日前くらいに完成版を実装したときは、認証機能をいったん無視して進めていた。

そのため、あとから user / user_id / リレーションを加える手戻り実装が発生した。

今後は、認証前提で「ログインユーザー本人の企業だけを扱う」設計に寄せる。

---

# 1. 現在の画面状態

現在の画面は、すでに「転職活動CRM」っぽい見た目になっている。

画面上には以下のような要素がある。

- Header
- JobHunt ロゴ
- 応募管理
- Dashboard
- 検討リスト
- 設定
- ログイン中ユーザー表示
- ログアウトボタン
- 応募企業管理画面
- 登録 / 一覧 / ログアウトボタン
- 応募総数
- 面談予定
- 返答待ち
- 内定
- 落選
- 検索フォーム
- 次に確認する企業
- 面談予定カード
- 確認待ちカード
- 高優先度カード

見た目としては、単なるCRUDではなく、すでに「転職活動を管理するアプリ」に見える状態。

---

# 2. Headerについて

Header は現時点では超おまけでよい。

今は機能を深追いしない。

現状で最低限ほしいものは以下。

- ロゴ
- 応募管理
- Dashboard
- 検討リスト
- 設定
- ログイン中ユーザー名
- ログアウト

ただし、今日は Header の機能拡張を優先しない。

理由は、CRUD後のメイン価値は Header ではなく、一覧・検索・お気に入り・次アクション管理にあるため。

---

# 3. 認証対応後の index

現在の index は、ログイン中ユーザー本人の企業だけを取得する形になっている。

    /**
     * 企業一覧を取得するメソッド。
     * ログイン中ユーザー本人の企業だけを取得する。
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // 自分の企業だけを対象にする。
        $query = Company::query()
            ->where('user_id', Auth::id());

        if ($request->filled('keyword')) {
            $keyword = $request->query('keyword');

            // keywordが指定された場合、企業名・メモ・次アクションを部分一致で検索する。
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('memo', 'like', "%{$keyword}%")
                    ->orWhere('next_action', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('media')) {
            $query->where('media', $request->query('media'));
        }

        $companies = $query
            ->orderByRaw('interview_date IS NULL')
            ->orderBy('interview_date')
            ->orderByDesc('created_at')
            ->get();

        return CompanyResource::collection($companies);
    }

---

# 4. index の役割

この index は、単なる一覧取得ではない。

やっていることは以下。

- ログインユーザー本人の企業だけ取得する
- keyword で企業名・メモ・次アクションを検索する
- status で絞り込む
- media で絞り込む
- 面談日がある企業を優先して並べる
- 作成日が新しい順でも並べる
- CompanyResource で整形して返す

つまり、完成版寄りの一覧取得APIになっている。

---

# 5. 認証対応で重要な部分

重要なのはここ。

    $query = Company::query()
        ->where('user_id', Auth::id());

これにより、ログイン中のユーザー本人の企業だけを対象にできる。

転職活動ログは個人データなので、他ユーザーの企業が見えてはいけない。

そのため、Company テーブルに user_id を持たせ、Auth::id() で絞り込む形にする。

---

# 6. 検索機能

完成品の機能として、検索機能がある。

検索対象は以下。

- keyword検索
- 会社名
- memo
- next_action
- status
- media

## keyword検索

keyword では、会社名・メモ・次アクションを部分一致検索する。

    if ($request->filled('keyword')) {
        $keyword = $request->query('keyword');

        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('memo', 'like', "%{$keyword}%")
                ->orWhere('next_action', 'like', "%{$keyword}%");
        });
    }

検索対象を name だけにしないのがポイント。

転職ログでは、企業名だけではなく、メモや次アクションから探したいことが多い。

例。

- 「React」
- 「Laravel」
- 「面談」
- 「返信」
- 「単価」
- 「リモート」
- 「Green」
- 「書類」

こういう語句で探せると、実用性が上がる。

## status検索

    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }

status で絞り込める。

例。

- 応募済み
- 選考中
- 面談予定
- 内定
- 落選
- 辞退

## media検索

    if ($request->filled('media')) {
        $query->where('media', $request->query('media'));
    }

媒体ごとに絞り込める。

例。

- Green
- type
- レバテック
- Wantedly
- エージェント
- 直応募

---

# 7. React側の検索イメージ

Laravel 側の index はすでに検索対応しているため、React側ではクエリパラメータを付けてリクエストする。

例。

    /api/companies?keyword=Laravel&status=応募済み&media=Green

React側では、検索フォーム用の state を持つ。

    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [media, setMedia] = useState("");

fetchCompanies の中で URLSearchParams を使う。

    async function fetchCompanies() {
      const params = new URLSearchParams();

      if (keyword) {
        params.append("keyword", keyword);
      }

      if (status) {
        params.append("status", status);
      }

      if (media) {
        params.append("media", media);
      }

      const response = await fetch(`${API_BASE_URL}/companies?${params.toString()}`);
      const json = await response.json();

      setCompanies(json.data);
    }

検索ボタンで fetchCompanies を呼ぶ。

    <button type="button" onClick={fetchCompanies}>
      検索
    </button>

これで Laravel の index に検索条件が渡る。

---

# 8. favorite機能

完成品の機能として favorite 機能がある。

一覧に SVG のハートマークを表示し、クリックでトグルする。

お気に入り企業は以下のように見た目を変える。

- ハートマークが塗りつぶされる
- 一覧行が少しピンク色になる
- 会社名にチップが付く

ただし、likes テーブルは作らない。

Company にプロパティとして持たせるだけでよい。

例。

    companies
    - is_favorite boolean default false

または、

    companies
    - favorite boolean default false

現時点では複雑なリレーションは不要。

JobHunt Lite の段階では、Company の属性として「お気に入りかどうか」を持たせるだけで十分。

---

# 9. favorite機能の価値

favorite 機能は見た目のインパクトが強い。

また、転職活動の実態にも合っている。

応募企業は全部同じ熱量ではない。

実際には以下のような温度差がある。

- 大本命
- 本命
- 気になる
- 練習用
- とりあえず応募
- 単価確認用
- 条件微妙だが面談する企業

これを UI で表現できるのが強い。

ハートマークや行の色によって、本命企業が一目で分かる。

---

# 10. favoriteの実装候補

## DB

Company テーブルに is_favorite を追加する。

    php artisan make:migration add_is_favorite_to_companies_table --table=companies

migration のイメージ。

    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('is_favorite')->default(false)->after('priority');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('is_favorite');
        });
    }

## Model

fillable に追加する。

    protected $fillable = [
        'user_id',
        'name',
        'media',
        'priority',
        'is_favorite',
        'status',
        'applied_date',
        'interview_date',
        'job_url',
        'interview_url',
        'memo',
        'next_action',
        'document_result',
        'first_interview_result',
        'second_interview_result',
        'final_result',
        'rejection_stage',
    ];

## Resource

CompanyResource に追加する。

    'isFavorite' => (bool) $this->is_favorite,

フロント側では camelCase で受ける。

    company.isFavorite

## React側

ハートボタンを置く。

    <button
      type="button"
      onClick={() => handleToggleFavorite(company)}
    >
      {company.isFavorite ? "♥" : "♡"}
    </button>

SVG を使う場合は、塗りつぶしの有無で切り替える。

---

# 11. favoriteトグル処理

簡易的には、Company の更新APIを使って is_favorite だけ反転させる。

    const handleToggleFavorite = async (company: Company) => {
      try {
        const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...company,
            is_favorite: !company.isFavorite,
          }),
        });

        if (!response.ok) {
          throw new Error("お気に入り更新に失敗しました。");
        }

        await fetchCompanies();
      } catch (e) {
        console.error(e);
      }
    };

ただし、CompanyResource は camelCase、DB は snake_case なので注意。

フロントから送る値は Laravel 側のバリデーションや fillable に合わせて snake_case にしたほうが分かりやすい。

    body: JSON.stringify({
      is_favorite: !company.isFavorite,
    })

その場合は PATCH 用の専用APIを作ってもよい。

---

# 12. ダッシュボード機能

完成品の機能としてダッシュボードがある。

現在のスクリーンショット上でも、以下の集計カードがある。

- 応募総数
- 面談予定
- 返答待ち
- 内定
- 落選

これは見た目としてかなり強い。

単なる企業一覧ではなく、転職活動全体の状況が見える。

転職活動では、件数の把握がかなり重要。

例。

- 何社応募しているか
- 何社面談予定か
- 何社返答待ちか
- 何社内定か
- 何社落選か

これが見えると、焦りを減らせる。

---

# 13. ダッシュボードで出す指標

現時点で出せる指標は以下。

## 応募総数

companies の総数。

    companies.length

## 面談予定

interview_date がある企業数。

    companies.filter((company) => company.interviewDate).length

または status が「面談予定」の企業数。

    companies.filter((company) => company.status === "面談予定").length

## 返答待ち

status が「応募済み」または「選考中」などの企業数。

    companies.filter((company) =>
      company.status === "応募済み" || company.status === "選考中"
    ).length

## 内定

status が「内定」の企業数。

    companies.filter((company) => company.status === "内定").length

## 落選

status が「落選」の企業数。

    companies.filter((company) => company.status === "落選").length

---

# 14. ダッシュボードは重くしすぎない

残り時間が5hなら、ダッシュボードを深掘りしすぎないほうがよい。

理由は、集計条件・表示条件・例外処理で時間を使いやすいから。

今日の優先順位としては、まず一覧画面を強くする。

おすすめ順は以下。

1. 検索・絞り込み
2. 落選グレーアウト
3. favoriteトグル
4. ActionLists
5. ダッシュボード調整

ダッシュボードは、最低限の件数表示ができれば一旦OK。

---

# 15. 次に確認する企業：ActionLists機能

完成品の機能として、次に確認する企業の ActionLists がある。

画面上では以下の3つのカードで表示する。

- 面談予定
- 確認待ち
- 高優先度

この機能はかなり良い。

理由は、転職活動において本当に必要なのは「全件を見ること」ではなく、「次に何を見るべきか分かること」だから。

---

# 16. ActionLists の価値

転職活動中は、企業が増えると管理が大変になる。

特に以下が見えなくなる。

- 次に面談がある企業
- 返答待ちの企業
- 優先度が高い企業
- 早めに確認すべき企業
- メモを見直すべき企業
- URLを開く必要がある企業

ActionLists は、この問題を解決する。

画面を開いた瞬間に「次に見る企業」が分かる。

---

# 17. ActionLists の分類条件

## 面談予定

条件例。

    interview_date が null ではない
    かつ status が 落選 / 辞退 / 内定 ではない

イメージ。

    const interviewCompanies = companies.filter((company) =>
      company.interviewDate &&
      company.status !== "落選" &&
      company.status !== "辞退" &&
      company.status !== "内定"
    );

## 確認待ち

条件例。

    next_action がある
    または status が 応募済み / 選考中

イメージ。

    const waitingCompanies = companies.filter((company) =>
      company.nextAction ||
      company.status === "応募済み" ||
      company.status === "選考中"
    );

## 高優先度

条件例。

    priority >= 4.0
    かつ status が 落選 / 辞退 ではない

イメージ。

    const highPriorityCompanies = companies.filter((company) =>
      Number(company.priority) >= 4.0 &&
      company.status !== "落選" &&
      company.status !== "辞退"
    );

---

# 18. ActionLists はフロント集計でOK

最初は Laravel 側に専用APIを作らなくてもよい。

companies を取得済みなら、React側で filter してカード表示できる。

理由は、今は JobHunt Lite の段階だから。

まずは画面上で価値が伝わることを優先する。

あとから API 側に切り出してもよい。

---

# 19. 落選 status のグレーアウト

完成品の機能として、落選 status の企業は一覧行をグレーアウトする。

さらに memo に分析文を出す。

これはかなり重要。

転職活動では、落選企業も消すわけではない。

落選企業は、あとから振り返るための学習ログになる。

ただし、通常の応募中企業と同じ見た目だとノイズになる。

そのため、一覧上では視覚的に弱める。

---

# 20. 落選グレーアウトの思想

落選企業は「不要なデータ」ではない。

むしろ以下の情報を持つ重要なログ。

- どの段階で落ちたか
- なぜ落ちたか
- どんな技術要件が足りなかったか
- 面接で何を聞かれたか
- 次回どう改善するか
- 単価感はどうだったか
- リモート条件はどうだったか

ただし、現在対応すべき企業ではない。

そのため、

    データとしては残す
    でも一覧上では目立たせない

という設計が合っている。

---

# 21. 落選グレーアウトの実装イメージ

    <tr
      key={company.id}
      className={`border-b ${
        company.status === "落選" ? "bg-slate-100 text-slate-400" : ""
      }`}
    >

status が落選なら、背景と文字色を弱める。

さらに memo を分析文として表示してもよい。

    {company.status === "落選" && company.memo && (
      <p className="mt-1 text-xs text-slate-500">
        分析：{company.memo}
      </p>
    )}

rejection_stage もチップ表示するとよい。

    {company.status === "落選" && company.rejectionStage && (
      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs">
        {company.rejectionStage}
      </span>
    )}

---

# 22. ウケ狙い実装

今回の「ウケ狙い実装」として一番強いのは、落選企業を成仏させるUI。

ネタっぽいが、普通に実用的。

内容は以下。

- 落選企業は薄く表示
- memo に落選分析を表示
- rejection_stage をチップ表示
- 現在対応中の企業と視覚的に分ける
- 消すのではなく、学習ログとして残す

表示例。

    株式会社〇〇
    状況：落選
    落選段階：1次面接
    分析：React経験は評価されたが、Laravel実務年数で見送り

この機能は面接でも話しやすい。

説明例。

    転職活動では落選企業も重要な学習ログになるため、
    単に削除せず、落選段階・メモ・分析を残せるようにしました。
    ただし一覧上ではグレーアウトし、現在対応すべき企業と視覚的に分けています。

これは「実体験から作ったアプリ」感が強い。

---

# 23. ウケ狙いとしての favorite

favorite もウケ狙いとして強い。

単なるお気に入りではなく、「本命企業が一目で分かる」UIにする。

例。

- ハートマーク
- 行を薄いピンク
- 会社名横に「本命」チップ
- 高優先度と組み合わせる
- ActionLists の高優先度にも出す

これは転職活動の温度感に合っている。

---

# 24. likesテーブルを作らない理由

favorite は、本格的なSNSの「いいね」ではない。

自分の応募企業に対する印付けである。

そのため、likes テーブルを作る必要はない。

Company に boolean カラムを持たせれば十分。

    is_favorite boolean default false

この判断は合理的。

理由。

- ユーザー同士のいいねではない
- 中間テーブルが不要
- 実装が軽い
- JobHunt Lite の範囲に合う
- あとから拡張可能

---

# 25. 今日の残り時間

今日はあと5h。

残り5hでやるなら、以下の順番がよい。

1. 検索・絞り込み
2. 落選グレーアウト
3. favoriteトグル
4. ActionLists
5. README / mdログ / git push

この順番が一番コスパがよい。

---

# 26. 5hプラン詳細

## 1h目：検索・絞り込み

やること。

- keyword state
- status state
- media state
- 検索ボタン
- fetchCompanies に query params 追加
- Laravel index の動作確認

勝利条件。

    会社名で検索できる
    memoで検索できる
    statusで絞り込める
    mediaで絞り込める

## 2h目：落選グレーアウト

やること。

- status === "落選" の行をグレー表示
- memo表示
- rejection_stage 表示
- 落選企業はボタンや文字を少し弱くする
- ただし操作は可能にする

勝利条件。

    落選企業が一覧上で明確に区別できる
    でも削除はせずログとして残る

## 3h目：favorite機能

やること。

- migrationで is_favorite 追加
- Company model fillable追加
- Resourceに追加
- 一覧でハート表示
- クリックでトグル
- お気に入り企業の行を少しピンクにする
- 会社名にチップを付ける

勝利条件。

    ハートを押すとお気に入り状態が切り替わる
    お気に入り企業が一覧上で目立つ

## 4h目：ActionLists

やること。

- 面談予定カード
- 確認待ちカード
- 高優先度カード
- companies から filter
- それぞれ最大数件を表示
- 詳細ボタンでモーダルを開けるようにする

勝利条件。

    次に確認すべき企業が画面上部で分かる

## 5h目：README / mdログ / git push

やること。

- 実装した機能を記録
- 詰まった点を記録
- なぜこの設計にしたかを書く
- 今後の改善点を書く
- git add
- git commit
- git push

勝利条件。

    今日の実装が説明可能な状態で残る

---

# 27. 今日の最短勝利条件

今日の勝利条件は以下。

    CRUD完了
    検索・絞り込みできる
    落選企業がグレーアウトする
    お気に入り企業が目立つ
    次に確認する企業がカードで見える

これができると、JobHunt Lite は「ただのCRUD」から「転職活動CRM」に変わる。

---

# 28. 優先順位

## 最優先

検索・絞り込み。

理由。

Laravel 側の index がすでに検索対応しているため、React側をつなぐだけで完成度が上がる。

## 次点

落選グレーアウト。

理由。

実装が軽いのに、アプリの思想が伝わりやすい。

## その次

favorite機能。

理由。

見た目のインパクトがあり、ポートフォリオで伝わりやすい。

## 余裕があれば

ActionLists。

理由。

CRM感が一気に出る。

ただし、条件分岐が増えるため、検索・落選・favorite の後でよい。

---

# 29. 実装候補の比較

## 検索・絞り込み

メリット。

- 実用性が高い
- Laravel index がほぼ完成している
- React側の実装でつながる
- API連携の説明がしやすい
- 転職活動CRMらしくなる

デメリット。

- URLSearchParams や state 管理が少し必要

## 落選グレーアウト

メリット。

- 実装が軽い
- 見た目で分かりやすい
- 実体験ベースの思想を説明しやすい
- ウケ狙いとしても実用としても強い

デメリット。

- 機能というよりUI表現に近い

## favorite

メリット。

- 見た目のインパクトがある
- 本命企業が分かりやすい
- ハートUIは直感的
- 行色やチップで完成度が出る

デメリット。

- migration が必要
- Resource / Request / Model / React の修正が必要

## ActionLists

メリット。

- CRM感が強い
- 次に確認すべき企業が分かる
- 転職活動の不安を減らす機能になる
- ダッシュボードより軽めに作れる

デメリット。

- 条件分岐が少し増える
- データが少ないと見栄えが弱い

## ダッシュボード

メリット。

- 完成品感が強い
- 数字で状況が見える
- スクショ映えする

デメリット。

- 深掘りしすぎると時間を食う
- 集計条件を決める必要がある
- 5hの中では優先しすぎないほうがよい

---

# 30. ルーティングとAPIの考え方

基本の CRUD は以下。

    GET /api/companies
    POST /api/companies
    PUT /api/companies/{company}
    DELETE /api/companies/{company}

検索・絞り込みは GET /api/companies にクエリパラメータを付ける。

    GET /api/companies?keyword=React
    GET /api/companies?status=応募済み
    GET /api/companies?media=Green
    GET /api/companies?keyword=React&status=応募済み&media=Green

favorite は方針が2つある。

## 方針A：既存 update を使う

    PUT /api/companies/{company}

メリット。

- 新規API不要
- 実装が早い

デメリット。

- お気に入り更新だけなのに全体更新っぽくなる

## 方針B：専用APIを作る

    PATCH /api/companies/{company}/favorite

メリット。

- 役割が明確
- トグル処理として分かりやすい

デメリット。

- route と Controller メソッド追加が必要

JobHunt Lite なら、最初は方針Aでもよい。

余裕があれば方針B。

---

# 31. user_id 対応で注意すること

認証対応後は、Company 作成時にも user_id を入れる必要がある。

store では以下のような考え方になる。

    public function store(StoreCompanyRequest $request): CompanyResource
    {
        $validated = $request->validated();

        $company = Company::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return new CompanyResource($company);
    }

または PHP の配列マージを使う。

    $company = Company::create(array_merge($validated, [
        'user_id' => Auth::id(),
    ]));

重要なのは、React側から user_id を送らせないこと。

user_id はログイン中ユーザーから Laravel 側で決める。

理由。

- フロントから送ると改ざんできる
- 他ユーザーの user_id を指定される危険がある
- Auth::id() を使う方が安全
- 認証済みユーザー本人のデータとして保存できる

---

# 32. update / destroy でも user_id を意識する

index では user_id で絞れている。

ただし、update や destroy でも本来は本人の企業だけ操作できるようにする必要がある。

ルートモデルバインディングだけだと、id が分かれば他人の Company を操作できる可能性がある。

本格対応するなら、Policy を使うか、Controller 内でチェックする。

簡易的には以下。

    if ($company->user_id !== Auth::id()) {
        abort(403);
    }

update。

    public function update(UpdateCompanyRequest $request, Company $company): CompanyResource
    {
        if ($company->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validated();

        $company->update($validated);

        return new CompanyResource($company);
    }

destroy。

    public function destroy(Company $company)
    {
        if ($company->user_id !== Auth::id()) {
            abort(403);
        }

        $company->delete();

        return response()->json([
            'message' => '企業を削除しました。'
        ]);
    }

今すぐ完璧にする必要はないが、認証対応後の重要ポイントとして残しておく。

---

# 33. 今日の実装で無理にやらなくてよいこと

残り5hなので、以下は深追いしない。

- Headerの高機能化
- 設定画面
- 本格的なDashboard専用API
- likesテーブル
- 複雑な認可Policy
- Google Calendar連携
- 通知機能
- AI分析機能
- 複雑なグラフ
- ページネーション
- 完璧なレスポンシブ調整

今日は、CRUD後の価値を見せる機能を優先する。

---

# 34. 今日やると強い機能セット

今日やると強いのは以下。

    検索機能
    落選グレーアウト
    favorite
    ActionLists

理由。

- すでにCRUDがある
- 転職活動CRMとしての価値が出る
- 実装量が重すぎない
- スクショ映えする
- 面接で説明しやすい
- Udemy教材化もしやすい
- Laravel / React 両方の復習になる

---

# 35. 面接での説明軸

このアプリは、単なるCRUDではなく、実際の転職活動ログをもとに作っている。

説明例。

    自分自身の転職活動で、応募企業・選考状況・次アクション・面談URL・求人URLの管理が煩雑になった経験から、転職活動専用のCRMとして作成しました。

    単なる企業一覧ではなく、検索・絞り込み、次に確認すべき企業の表示、お気に入り、落選企業の分析ログ化など、実際に使う場面を想定した機能を入れています。

    Laravel API 側ではログインユーザー本人の企業だけを取得するように user_id で制御し、React 側では一覧表示・編集モーダル・検索・状態更新を実装しています。

この説明はかなり強い。

---

# 36. ウケ狙いというより実体験駆動

「ウケ狙い実装」と言っているが、実際にはかなり実用的。

特に以下は、転職活動経験者には刺さる。

- 落選企業を消さずに薄くする
- 落選理由や分析を memo に残す
- 本命企業を favorite で目立たせる
- 次に確認する企業をカード化する
- 応募総数や返答待ちを可視化する

これは、ただのネタではなく、実体験から出たUX。

---

# 37. READMEに書ける内容

README には以下を書ける。

## 主な機能

- 企業登録
- 企業一覧表示
- 企業詳細編集
- 企業削除
- 企業名 / メモ / 次アクションの keyword 検索
- status 絞り込み
- media 絞り込み
- お気に入り企業のトグル
- お気に入り企業の視覚的強調
- 応募総数 / 面談予定 / 返答待ち / 内定 / 落選の集計
- 次に確認する企業の表示
- 落選企業のグレーアウト
- 落選理由・分析メモの表示
- ログインユーザー本人の企業のみ表示

## 技術的に意識した点

- Laravel API Resource によるレスポンス整形
- FormRequest によるバリデーション分離
- user_id によるユーザー別データ管理
- React state によるフォーム管理
- URLSearchParams による検索条件送信
- CRUD後の一覧再取得による表示同期
- status / priority / interview_date による転職活動向けの並び替え
- 落選企業を削除せず、学習ログとして残すUI設計

---

# 38. Udemy教材化で使えるポイント

この章は Udemy教材化にもかなり向いている。

解説ポイントは以下。

- CRUDの基礎
- Laravel API の作り方
- Resource と Request の違い
- React fetch の基本
- 一覧更新
- 編集モーダル
- 削除確認
- 検索クエリ
- user_id 対応
- 認証後の手戻りポイント
- favorite を likes テーブルなしで実装する判断
- 落選グレーアウトという実務的UI判断
- ActionLists のような価値ある派生機能

特に「最初に認証を無視して作り、あとから user_id を加えると手戻りになる」という経験は教材として価値がある。

---

# 39. 今回の学習ログとして重要な点

今回の重要ポイント。

    CRUDが終わったあと、何を足すとアプリっぽくなるか
    認証を後付けすると user_id 対応が必要になる
    index は単なる一覧ではなく、本人データ取得 + 検索 + 並び替えの中心になる
    検索は Laravel 側の query と React 側の URLSearchParams でつながる
    favorite は likes テーブルなしでも成立する
    落選企業は削除ではなく学習ログとして残せる
    ActionLists は転職活動CRMらしさを一気に出す
    ダッシュボードは深追いしすぎず、まずは一覧機能を強くする

---

# 40. 次にやるなら

次にやるなら、まず検索・絞り込み。

理由。

Laravel 側の index がすでに対応済みだから。

React 側で以下をつなぐ。

    keyword
    status
    media
    fetchCompanies
    URLSearchParams
    検索ボタン

次に落選グレーアウト。

その次に favorite。

最後に ActionLists。

---

# 41. 今日の最終ゴール

今日の最終ゴールは以下。

    CRUDだけのアプリから、
    転職活動CRMとして意味があるアプリに変える。

具体的には以下。

    検索できる
    絞り込める
    本命企業が分かる
    落選企業が視覚的に分かれる
    次に見る企業が分かる
    ログインユーザー本人の企業だけ扱う

ここまで行けば、JobHunt Lite はかなり見せられる。

---

# 42. まとめ

JobHunt Lite は、現時点で基本CRUDが完了している。

次のフェーズでは、単なるCRUDから「転職活動CRM」に見える機能を足す。

優先順位は以下。

    1. 検索・絞り込み
    2. 落選グレーアウト
    3. favoriteトグル
    4. ActionLists
    5. ダッシュボード調整
    6. README / mdログ / git push

特に重要なのは、検索と落選グレーアウト。

検索は実用性が高く、Laravel 側の index と自然につながる。

落選グレーアウトは、実体験ベースのUXとしてかなり強い。

favorite は見た目のインパクトがあり、本命企業を一目で分かるようにできる。

ActionLists は、次に確認すべき企業を見せることで、転職活動CRMらしさを一気に出せる。

今日5hでここまで進めば、JobHunt Lite は「Laravel復習用CRUD」から「実用的な転職活動管理アプリ」にかなり近づく。
