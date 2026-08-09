import { useState } from "react";

type LoginProps = {
  onLoginSuccess: (token: string) => void;
  onSwitchToRegister: () => void;
};

function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api";

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました。");
      }

      const json = await response.json();

      localStorage.setItem("authToken", json.token);
      onLoginSuccess(json.token);
    } catch (e) {
      console.error(e);
      alert("ログインに失敗しました。");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-sm rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">JobHunt Lite</h1>
        <p className="mb-6 text-sm text-slate-500">
          ログインして応募企業を管理します。
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="password123"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            ログインする
          </button>
        </form>

        {/* <button
          type="button"
          onClick={onSwitchToRegister}
          className="mt-4 w-full text-center text-sm font-semibold text-slate-600 underline"
        >
          アカウントを作成する
        </button> */}
        <button
          type="button"
          onClick={() => {
            console.log("register button clicked");
            onSwitchToRegister();
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-slate-600 underline"
        >
          アカウントを作成する
        </button>
      </div>
    </main>
  );
}

export default Login;
