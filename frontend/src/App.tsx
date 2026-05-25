import { useEffect, useState } from "react";

function App() {
  // Laravel APIから取得したメッセージを保存するstate
  const [message, setMessage] = useState("");

  // 画面表示時に1回だけAPIを呼び出す
  useEffect(() => {
    const fetchMessage = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/hello");

      const json = await res.json();

      setMessage(json.message);
    };

    fetchMessage();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>JobHunt Lite</h1>

      <h2>Laravel API 疎通確認</h2>

      <p>Laravelから取得したメッセージ：</p>

      <strong>{message}</strong>
    </div>
  );
}

export default App;