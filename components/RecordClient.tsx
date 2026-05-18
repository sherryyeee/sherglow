"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { name: "学习", icon: "📖", bg: "#FFF0F5" },
  { name: "成长", icon: "🌱", bg: "#F0FAF0" },
  { name: "生活", icon: "☕", bg: "#FFF8F0" },
  { name: "运动", icon: "🎾", bg: "#F0FFF0" },
  { name: "情绪", icon: "🐻", bg: "#F5F0FF" },
  { name: "成就", icon: "⭐", bg: "#FFFAEE" },
];

type GrowthRecord = { id: number; category: string; content: string };
// "input" = 正常输入; "saving" = 生成中; "confirm" = 询问更新; "done" = 已完成
type Mode = "input" | "saving" | "confirm" | "done";

interface Props {
  today: string;
  initialRecords: GrowthRecord[];
  initialGlowResponse: string | null;
}

export default function RecordClient({ today, initialRecords, initialGlowResponse }: Props) {
  const router = useRouter();
  const [records, setRecords] = useState<GrowthRecord[]>(initialRecords);
  const [glowResponse, setGlowResponse] = useState<string | null>(initialGlowResponse);
  const [mode, setMode] = useState<Mode>("input");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState("学习");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addRecord() {
    if (!newContent.trim()) return;
    const res = await fetch("/api/growth-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, category: newCategory, content: newContent.trim() }),
    });
    if (res.ok) {
      const { record } = await res.json();
      setRecords((prev) => [...prev, record]);
      setNewContent("");
      setNewCategory("学习");
      setShowAddForm(false);
    }
  }

  async function deleteRecord(id: number) {
    const res = await fetch(`/api/growth-records/${id}`, { method: "DELETE" });
    if (res.ok) setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  async function generateGlow() {
    setMode("saving");
    try {
      const res = await fetch("/api/glow-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, records }),
      });
      const data = await res.json();
      if (data.response) setGlowResponse(data.response);
      else setGlowResponse("今天记录了这些，已经很好了，为自己鼓掌 🌸");
    } catch {
      setGlowResponse("今天记录了这些，已经很好了，为自己鼓掌 🌸");
    }
    setMode("done");
  }

  function handleSave() {
    if (records.length === 0) {
      setError("先添加至少一条成长记录哦 🌱");
      return;
    }
    setError(null);
    if (glowResponse !== null) {
      setMode("confirm");
    } else {
      generateGlow();
    }
  }

  return (
    <div className="min-h-full px-5 pt-12 pb-40">
      {/* 页头 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-bold text-[#3D2832]">记录今天的成长</h1>
        <button
          onClick={() => { router.push("/"); router.refresh(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#F0D8E4] text-[#A89098] text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* 已有记录列表 */}
      {records.length > 0 && (
        <div className="space-y-2 mb-4">
          {records.map((r) => {
            const cat = CATEGORIES.find((c) => c.name === r.category);
            return (
              <div key={r.id} className="flex items-start gap-3 bg-white rounded-xl px-3 py-2.5 border border-[#F9D8E4]">
                <span className="text-base mt-0.5">{cat?.icon ?? "✨"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#F28BA8] font-semibold mb-0.5">{r.category}</p>
                  <p className="text-[13px] text-[#3D2832] leading-snug">{r.content}</p>
                </div>
                {/* 只在输入模式下可删除 */}
                {mode === "input" && (
                  <button
                    onClick={() => deleteRecord(r.id)}
                    className="text-[#C4ACB4] text-xl leading-none mt-0.5 flex-shrink-0"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 根据 mode 显示不同的下方内容 ── */}

      {/* 输入模式：添加表单 + 错误提示 */}
      {mode === "input" && (
        <>
          {showAddForm ? (
            <div className="bg-white rounded-2xl p-4 border border-[#F9D8E4] mb-4"
              style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)" }}>
              <p className="text-[12px] text-[#A89098] font-semibold mb-2.5">选择分类</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setNewCategory(cat.name)}
                    className="flex flex-col items-center py-2.5 rounded-xl border transition-all"
                    style={{
                      background: newCategory === cat.name ? "#FDE8EE" : cat.bg,
                      borderColor: newCategory === cat.name ? "#F28BA8" : "transparent",
                    }}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[11px] text-[#3D2832] font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-[#A89098] font-semibold mb-2">写下这件事</p>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="今天学了什么、做了什么、感受到了什么..."
                className="w-full rounded-xl border border-[#F0D8E4] px-3 py-2.5 text-[13px] text-[#3D2832] placeholder-[#C4ACB4] resize-none outline-none focus:border-[#F28BA8]"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setShowAddForm(false); setNewContent(""); setNewCategory("学习"); }}
                  className="flex-1 py-2.5 rounded-xl text-[13px] text-[#A89098] bg-white border border-[#F0D8E4]"
                >
                  取消
                </button>
                <button
                  onClick={addRecord}
                  disabled={!newContent.trim()}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{
                    background: newContent.trim()
                      ? "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)"
                      : "#E0C8D0",
                  }}
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 mb-4 rounded-2xl border border-dashed border-[#F28BA8] text-[13px] text-[#F28BA8] font-medium bg-white active:opacity-70"
            >
              + 添加一条成长
            </button>
          )}
          {error && <p className="text-[12px] text-[#F28BA8] text-center mb-3">{error}</p>}
        </>
      )}

      {/* 生成中：内联 loading */}
      {mode === "saving" && (
        <div className="flex flex-col items-center py-6 gap-2">
          <span className="text-3xl animate-bounce">🌸</span>
          <p className="text-[13px] font-semibold text-[#3D2832]">Glow 正在回应中...</p>
          <p className="text-[12px] text-[#A89098]">正在为你生成专属鼓励</p>
        </div>
      )}

      {/* 询问是否更新：内联确认卡片 */}
      {mode === "confirm" && (
        <div className="bg-white rounded-2xl p-4 border border-[#F9D8E4] mb-4 text-center"
          style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)" }}>
          <p className="text-[13px] font-semibold text-[#3D2832] mb-1">你今天已经有 Glow 回应了</p>
          <p className="text-[12px] text-[#A89098] mb-4">要根据新的记录重新生成吗？</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("done")}
              className="flex-1 py-2.5 rounded-xl text-[13px] text-[#A89098] bg-white border border-[#F0D8E4]"
            >
              暂不更新
            </button>
            <button
              onClick={generateGlow}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)" }}
            >
              更新回应
            </button>
          </div>
        </div>
      )}

      {/* 完成：内联 Glow 回应 + 回首页按钮 */}
      {mode === "done" && glowResponse && (
        <div className="mb-4">
          <div className="rounded-2xl mb-4 overflow-hidden flex items-end"
            style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
            <div className="flex-1 p-4">
              <p className="text-[12px] text-[#C4607A] font-semibold mb-2">🌸 Glow 想对你说</p>
              <p className="text-[14px] text-[#6B3050] leading-relaxed">{glowResponse}</p>
            </div>
            <img src="/glow/glow-response-card.png" alt="Glow"
              className="w-24 h-24 object-contain object-bottom flex-shrink-0" />
          </div>
          <button
            onClick={() => { router.push("/"); router.refresh(); }}
            className="w-full py-3 rounded-2xl text-[14px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)", boxShadow: "0 4px 16px rgba(242,139,168,0.20)" }}
          >
            回到首页
          </button>
        </div>
      )}

      {/* 保存按钮 — 只在输入模式显示，固定在导航栏上方 */}
      {mode === "input" && !showAddForm && (
        <div className="fixed bottom-16 left-0 right-0 z-40"
          style={{ background: "linear-gradient(to top, #FFF8F6 85%, transparent)" }}>
          <div className="max-w-lg mx-auto px-5 pb-3 pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)", boxShadow: "0 4px 16px rgba(242,139,168,0.30)" }}
            >
              保存今天的成长
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
