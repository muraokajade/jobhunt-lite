| プロパティ              | 型      | 意味           |
| ----------------------- | ------- | -------------- | ------------------------------------- |
| id                      | number  | 企業データのID |
| user_id                 | number  | null           | 登録ユーザーID。認証実装前はnull許可  |
| name                    | string  | 企業名         |
| media                   | string  | null           | 応募媒体。Green / type / Wantedlyなど |
| priority                | string  | null           | 志望度・優先度                        |
| status                  | string  | 応募ステータス |
| applied_date            | string  | null           | 応募日                                |
| interview_date          | string  | null           | 面談・面接日時                        |
| job_url                 | string  | null           | 求人URL                               |
| interview_url           | string  | null           | 面接URL                               |
| memo                    | string  | null           | メモ                                  |
| next_action             | string  | null           | 次にやること                          |
| document_result         | string  | null           | 書類選考結果                          |
| first_interview_result  | string  | null           | 一次面接結果                          |
| second_interview_result | string  | null           | 二次面接結果                          |
| final_result            | string  | null           | 最終面接結果                          |
| rejection_stage         | string  | null           | 落選ステージ                          |
| is_favorite             | boolean | お気に入り状態 |
| created_at              | string  | 作成日時       |
| updated_at              | string  | 更新日時       |
