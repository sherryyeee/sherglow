"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

// 只允许跳回站内页面，避免被拼接成外部链接
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/space";
}

export default function UnlockPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = safeNext(new URLSearchParams(window.location.search).get("next"));
      return;
    }
    setLoading(false);
    setPassword("");
    setError(
      res.status === 401 ? "密码不正确，再试一次"
        : res.status === 403 ? "演示站无需密码，直接返回首页查看即可"
        : "暂时无法解锁，请稍后再试"
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: "#FFF8F6" }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}
      >
        <Lock size={24} color="#C4607A" strokeWidth={2} />
      </div>
      <h1 className="text-[18px] font-bold text-[#3D2832] mb-1">私人空间已上锁</h1>
      <p className="text-[13px] text-[#A89098] mb-6 text-center">日记和成长记录只属于你，输入密码后进入</p>

      <form onSubmit={submit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          placeholder="输入密码"
          className="w-full px-4 py-3 rounded-2xl border border-[#F9D8E4] bg-white text-[15px] text-[#3D2832] outline-none focus:border-[#F28BA8]"
        />
        {error && <p className="text-[12px] text-[#D4607A] text-center">{error}</p>}
        <button
          type="submit"
          disabled={!password || loading}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)" }}
        >
          {loading ? "解锁中…" : "解锁"}
        </button>
      </form>

      <Link href="/" className="mt-6 text-[13px] text-[#C4ACB4]">返回首页</Link>
    </main>
  );
}
