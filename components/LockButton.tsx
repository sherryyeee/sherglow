"use client";

import { Lock } from "lucide-react";

// 手动上锁：清除解锁 cookie 后回到首页
export default function LockButton() {
  async function lock() {
    await fetch("/api/lock", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button
      onClick={lock}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#C4607A] border border-[#F9D8E4] bg-white"
    >
      <Lock size={12} strokeWidth={2} />
      上锁
    </button>
  );
}
