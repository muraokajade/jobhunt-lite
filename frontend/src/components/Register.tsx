import { useState } from "react";

type RegisterProps = {
  onRegisterSuccess: (token: string) => void;
  onSwitchToLogin: () => void;
};

const API_BASE_URL = "http://127.0.0.1:8001/api";

function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  // ユーザー登録フォームの入力値を管理するstate。
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 登録APIを実行する処理。
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("ユーザー登録に失敗しました。");
      }

      const json = await response.json();

      localStorage.setItem("authToken", json.token);
      onRegisterSuccess(json.token);
    } catch (e) {
      console.error(e);
      alert("ユーザー登録に失敗しました。");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">JobHunt Lite</h1>
        <p className="mb-6 text-sm text-slate-500">
          アカウントを作成して、応募企業を管理します。
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">名前</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="例：山田太郎"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="8文字以上"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            登録する
          </button>
        </form>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="mt-4 text-sm font-semibold text-slate-700 underline"
        >
          すでにアカウントを持っている方はこちら
        </button>
      </div>
    </main>
  );
}

export default Register;
