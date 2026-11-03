"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { randomQuote, type Encouragement } from "@/lib/quotes";

// 首页"每日鼓舞"的文字层。解锁后"换一张"让 AI 重写；否则从语录库随机换。
export default function EncouragementCard({
  initial, useAI, textColor, attrColor,
}: {
  initial: Encouragement;
  useAI: boolean;
  textColor: string;
  attrColor: string;
}) {
  const [card, setCard] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function next() {
    if (loading) return;
    if (!useAI) {
      setCard(randomQuote(card.text));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/encouragement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avoid: card.text }),
      });
      setCard(res.ok ? await res.json() : randomQuote(card.text));
    } catch {
      setCard(randomQuote(card.text));
    }
    setLoading(false);
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-start items-center p-5 pt-6 z-10 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="text-sm leading-none">💗</span>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: attrColor }}>
          每日鼓舞
        </p>
      </div>

      <p
        className="leading-snug whitespace-pre-line transition-opacity"
        style={{
          fontFamily: '"LXGW WenKai GB Medium", serif',
          fontSize: "1.3rem",
          color: textColor,
          textShadow: "0 1px 16px rgba(255,235,240,0.85)",
          opacity: loading ? 0.4 : 1,
        }}
      >
        {card.text}
      </p>

      <p className="text-[11px] mt-3" style={{ color: attrColor, opacity: loading ? 0.4 : 1 }}>
        — {card.attr}
      </p>

      <button
        onClick={next}
        disabled={loading}
        className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/60 active:opacity-60"
        style={{ color: attrColor, backdropFilter: "blur(4px)" }}
        aria-label="换一张"
      >
        <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
        换一张
      </button>
    </div>
  );
}
