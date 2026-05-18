"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/components/MoodFaces";

// ── Types ─────────────────────────────────────────────────────────────────────

type TodayEntry = {
  id: number;
  mood: string;
  tags: string[] | null;
  free_text: string | null;
  ai_response: string | null;
  ai_personal_response: string | null;
  created_at: string;
};

// ── Tags ──────────────────────────────────────────────────────────────────────

const TAGS = [
  { key: "work",   label: "工作", emoji: "💼" },
  { key: "job",    label: "求职", emoji: "🎯" },
  { key: "study",  label: "学习", emoji: "📚" },
  { key: "health", label: "身体", emoji: "🌿" },
  { key: "social", label: "关系", emoji: "💛" },
  { key: "rest",   label: "休息", emoji: "😴" },
  { key: "win",    label: "成就", emoji: "✨" },
  { key: "mind",   label: "心理", emoji: "🌧️" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeStr(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString("zh-CN", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const primaryBtn = "w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-opacity active:opacity-70";
const ghostBtn   = "w-full py-3 rounded-2xl text-[14px] font-medium text-[#C4ACB4] transition-opacity active:opacity-70";

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MoodPage() {
  const router = useRouter();

  // Today's entries (loaded on mount, refreshed after each save)
  const [todayEntries, setTodayEntries] = useState<TodayEntry[]>([]);
  const [isCheckingToday, setIsCheckingToday] = useState(true);

  // Recording flow state
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [aiMoodResponse, setAiMoodResponse] = useState("");
  const [isLoadingMood, setIsLoadingMood] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recognitionRef = useRef<any>(null);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchTodayEntries = useCallback(async () => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
    const { data } = await supabase
      .from("mood_entries")
      .select("id, mood, tags, ai_response, ai_personal_response, free_text, created_at")
      .eq("date", today)
      .order("created_at", { ascending: true });
    return (data || []) as TodayEntry[];
  }, []);

  useEffect(() => {
    fetchTodayEntries().then((entries) => {
      setTodayEntries(entries);
      setIsCheckingToday(false);
    });
  }, [fetchTodayEntries]);

  // ── Recording handlers ───────────────────────────────────────────────────────

  const startRecording = () => {
    setStep(1);
    setSelectedMood(null);
    setAiMoodResponse("");
    setSelectedTags([]);
    setFreeText("");
    setIsRecording(true);
  };

  const handleMoodSelect = async (moodKey: string) => {
    if (isLoadingMood) return;
    setSelectedMood(moodKey);
    setAiMoodResponse("");
    setIsLoadingMood(true);
    try {
      const res = await fetch("/api/mood-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "mood", mood: moodKey }),
      });
      const data = await res.json();
      setAiMoodResponse(data.response || "");
    } catch {
      setAiMoodResponse("今天辛苦了，好好照顾自己 ✨");
    }
    setIsLoadingMood(false);
  };

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }
    if (isListening) { recognitionRef.current?.stop(); return; }
    const r = new SR();
    r.lang = "zh-CN";
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onend   = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setFreeText((prev) => (prev ? `${prev} ${t}` : t));
    };
    recognitionRef.current = r;
    r.start();
  };

  const handleComplete = async (skipText = false) => {
    const text = skipText ? "" : freeText.trim();
    setIsLoadingText(true);
    let personalResponse = "";

    if (text) {
      try {
        const tagLabels = selectedTags.map((k) => TAGS.find((t) => t.key === k)?.label).filter(Boolean);
        const res = await fetch("/api/mood-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "text", mood: selectedMood, tags: tagLabels, text }),
        });
        const data = await res.json();
        personalResponse = data.response || "";
      } catch { /* silent */ }
    }

    setIsLoadingText(false);
    setIsSaving(true);

    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
      const tagLabels = selectedTags.map((k) => TAGS.find((t) => t.key === k)?.label).filter(Boolean);
      await supabase.from("mood_entries").insert({
        date: today,
        mood: selectedMood,
        tags: tagLabels.length ? tagLabels : null,
        free_text: text || null,
        ai_response: aiMoodResponse || null,
        ai_personal_response: personalResponse || null,
      });
    } catch { /* silent */ }

    setIsSaving(false);

    // Re-fetch and go back to overview
    const updated = await fetchTodayEntries();
    setTodayEntries(updated);
    setIsRecording(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isCheckingToday) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF8F6" }}>
        <p className="text-[13px] text-[#C4ACB4] animate-pulse">加载中…</p>
      </div>
    );
  }

  // Show recording flow
  if (isRecording || todayEntries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F6" }}>
        <button
          onClick={() => todayEntries.length > 0 ? setIsRecording(false) : router.back()}
          className="absolute top-12 left-5 text-[#C4ACB4] text-sm font-medium"
        >
          ← 返回
        </button>

        {step === 1 && (
          <Step1
            selectedMood={selectedMood}
            aiMoodResponse={aiMoodResponse}
            isLoadingMood={isLoadingMood}
            onSelect={handleMoodSelect}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            selectedTags={selectedTags}
            onToggle={toggleTag}
            onNext={() => setStep(3)}
            onSkip={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            freeText={freeText}
            setFreeText={setFreeText}
            isListening={isListening}
            speechSupported={speechSupported}
            isLoading={isLoadingText || isSaving}
            onVoice={handleVoice}
            onComplete={() => handleComplete(false)}
            onSkip={() => handleComplete(true)}
          />
        )}
      </div>
    );
  }

  // Show today's overview
  return (
    <TodayOverview
      entries={todayEntries}
      onAddMore={startRecording}
      onHome={() => router.push("/")}
    />
  );
}

// ── Today's Overview ──────────────────────────────────────────────────────────

function TodayOverview({
  entries, onAddMore, onHome,
}: {
  entries: TodayEntry[];
  onAddMore: () => void;
  onHome: () => void;
}) {
  const latestEntry = entries[entries.length - 1];
  const latestMood = MOODS.find((m) => m.key === latestEntry?.mood);
  const Face = latestMood?.Face;

  // Aggregate all unique tags from today
  const allTags = [...new Set(entries.flatMap((e) => e.tags || []))];

  const today = new Date().toLocaleDateString("zh-CN", {
    timeZone: "Australia/Sydney",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col pb-10" style={{ background: "#FFF8F6" }}>
      <button onClick={onHome} className="absolute top-12 left-5 text-[#C4ACB4] text-sm font-medium">
        ← 返回
      </button>

      {/* Header */}
      <div className="px-5 pt-16 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-1">
          今日心情概览
        </p>
        <p className="text-xs text-[#C4ACB4]">{today}</p>
      </div>

      {/* Latest mood summary */}
      <div className="px-5 mb-5">
        <div
          className="bg-white rounded-2xl px-5 py-5 border border-[#F9D8E4] flex items-center gap-4"
          style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}
        >
          {Face && (
            <div style={{ width: 56, height: 56, flexShrink: 0 }}>
              <Face />
            </div>
          )}
          <div>
            <p className="text-[15px] font-bold text-[#3D2832]">{latestMood?.label}</p>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#FDE8EE", color: "#F28BA8" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 flex-1">
        <p className="text-[12px] font-semibold text-[#C4ACB4] tracking-widest uppercase mb-4">
          今日心路
        </p>

        <div className="relative">
          {entries.map((entry, idx) => {
            const isLast = idx === entries.length - 1;
            const moodData = MOODS.find((m) => m.key === entry.mood);
            const EntryFace = moodData?.Face;
            const timeStr = getTimeStr(entry.created_at);
            const aiText = entry.ai_personal_response || entry.ai_response;

            return (
              <div key={entry.id} className="relative pl-8 pb-6">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className="absolute left-[5px] top-4 w-[2px]"
                    style={{ height: "calc(100% - 4px)", background: "#F9D8E4" }}
                  />
                )}
                {/* Dot */}
                <div
                  className="absolute top-[5px] left-0 w-3 h-3 rounded-full"
                  style={{
                    background: moodData?.ring || "#F28BA8",
                    boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${moodData?.ring || "#F28BA8"}`,
                  }}
                />

                {/* Time + face + mood label */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[11px] text-[#C4ACB4] font-medium tabular-nums">
                    {timeStr}
                  </span>
                  {EntryFace && (
                    <div style={{ width: 22, height: 22, flexShrink: 0 }}>
                      <EntryFace />
                    </div>
                  )}
                  <span className="text-[12px] font-semibold text-[#3D2832]">
                    {moodData?.label}
                  </span>
                </div>

                {/* User text */}
                {entry.free_text && (
                  <p
                    className="text-[12px] text-[#3D2832] leading-relaxed mb-2 pl-2 border-l-[2px]"
                    style={{ borderColor: moodData?.ring || "#F28BA8" }}
                  >
                    「{entry.free_text}」
                  </p>
                )}

                {/* AI response */}
                {aiText && (
                  <p className="text-[12px] text-[#A89098] leading-relaxed">
                    ✦ {aiText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pt-2 space-y-2">
        <button onClick={onAddMore} className={primaryBtn} style={{ background: "#D4788A" }}>
          + 再倾诉一次
        </button>
        <button onClick={onHome} className={ghostBtn}>回到首页</button>
      </div>
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1({
  selectedMood, aiMoodResponse, isLoadingMood, onSelect, onNext,
}: {
  selectedMood: string | null;
  aiMoodResponse: string;
  isLoadingMood: boolean;
  onSelect: (key: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 px-5 pt-20 pb-10">
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase">1 / 3</p>
        <h2 className="text-2xl font-bold text-[#3D2832] mt-1">今天感觉怎么样？</h2>
      </div>

      <div className="mt-8 bg-white rounded-3xl py-7 px-3 border border-[#F9D8E4]"
        style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.07)" }}>
        <div className="flex justify-between items-start px-1">
          {MOODS.map((mood) => {
            const active = selectedMood === mood.key;
            const Face = mood.Face;
            return (
              <button
                key={mood.key}
                onClick={() => onSelect(mood.key)}
                className="flex flex-col items-center gap-2"
                style={{
                  transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: active ? "scale(1.14) translateY(-4px)" : "scale(1)",
                }}
              >
                <div style={{
                  width: 58, height: 58, borderRadius: "50%", overflow: "hidden",
                  boxShadow: active
                    ? `0 0 0 2.5px ${mood.ring}, 0 8px 24px ${mood.glow}`
                    : "0 2px 10px rgba(0,0,0,0.07)",
                  transition: "box-shadow 0.25s ease",
                }}>
                  <Face />
                </div>
                <span className="text-[11px] font-semibold"
                  style={{ color: active ? "#3D2832" : "#C4ACB4", transition: "color 0.2s ease" }}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMood && (
        <div className="mt-5 px-1">
          {isLoadingMood ? (
            <p className="text-[13px] text-[#C4ACB4] text-center animate-pulse">正在感受你的心情…</p>
          ) : aiMoodResponse ? (
            <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4]"
              style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
              <p className="text-[13px] text-[#7A5560] leading-relaxed">{aiMoodResponse}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-auto pt-6">
        {selectedMood && !isLoadingMood && (
          <button onClick={onNext} className={primaryBtn} style={{ background: "#D4788A" }}>
            继续 →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2({
  selectedTags, onToggle, onNext, onSkip,
}: {
  selectedTags: string[];
  onToggle: (key: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 px-5 pt-20 pb-10">
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase">2 / 3</p>
        <h2 className="text-2xl font-bold text-[#3D2832] mt-1">今天主要关于什么？</h2>
        <p className="text-xs text-[#C4ACB4] mt-1">可以多选，也可以跳过</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {TAGS.map((tag) => {
          const active = selectedTags.includes(tag.key);
          return (
            <button
              key={tag.key}
              onClick={() => onToggle(tag.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border transition-all"
              style={{
                background: active ? "#F28BA8" : "white",
                color: active ? "white" : "#9C8589",
                borderColor: active ? "#F28BA8" : "#F9D8E4",
                boxShadow: active ? "0 2px 10px rgba(242,139,168,0.30)" : "none",
              }}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 space-y-2">
        <button onClick={onNext} className={primaryBtn} style={{ background: "#D4788A" }}>继续 →</button>
        <button onClick={onSkip} className={ghostBtn}>跳过</button>
      </div>
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3({
  freeText, setFreeText, isListening, speechSupported, isLoading,
  onVoice, onComplete, onSkip,
}: {
  freeText: string;
  setFreeText: (v: string) => void;
  isListening: boolean;
  speechSupported: boolean;
  isLoading: boolean;
  onVoice: () => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 px-5 pt-20 pb-10">
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase">3 / 3</p>
        <h2 className="text-2xl font-bold text-[#3D2832] mt-1">还想多说点什么吗？</h2>
        <p className="text-xs text-[#C4ACB4] mt-1">完全可选，说什么都好</p>
      </div>

      <div className="mt-6 relative">
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="今天发生了什么？有什么心里话？"
          rows={6}
          className="w-full bg-white border border-[#F9D8E4] rounded-2xl px-4 py-3.5 text-[14px] text-[#3D2832] placeholder-[#D4C0C8] outline-none resize-none leading-relaxed"
          style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.06)" }}
        />
        {speechSupported && (
          <button
            onClick={onVoice}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isListening ? "#F28BA8" : "#FDE8EE",
              boxShadow: isListening ? "0 0 0 4px rgba(242,139,168,0.25)" : "none",
            }}
            title={isListening ? "点击停止" : "语音输入"}
          >
            {isListening
              ? <span className="text-white text-base leading-none">■</span>
              : <span className="text-[#F28BA8] text-base leading-none">🎙️</span>}
          </button>
        )}
      </div>

      {isListening && (
        <p className="mt-2 text-[12px] text-[#F28BA8] text-center font-medium animate-pulse">
          🔴 正在聆听，说完后自动停止…
        </p>
      )}

      <div className="mt-auto pt-6 space-y-2">
        <button
          onClick={onComplete}
          disabled={isLoading}
          className={primaryBtn}
          style={{ background: isLoading ? "#E8B4BF" : "#D4788A" }}
        >
          {isLoading ? "保存中…" : "完成 ✓"}
        </button>
        {!isLoading && (
          <button onClick={onSkip} className={ghostBtn}>跳过，直接保存</button>
        )}
      </div>
    </div>
  );
}
