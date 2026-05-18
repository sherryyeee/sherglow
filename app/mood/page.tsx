"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOODS, FaceHappy, FaceCalm, FaceNeutral, FaceSad, FaceTired } from "@/components/MoodFaces";

// ── Tag definitions ───────────────────────────────────────────────────────────

const TAGS = [
  { key: "work",    label: "工作",  emoji: "💼" },
  { key: "job",     label: "求职",  emoji: "🎯" },
  { key: "study",   label: "学习",  emoji: "📚" },
  { key: "health",  label: "身体",  emoji: "🌿" },
  { key: "social",  label: "关系",  emoji: "💛" },
  { key: "rest",    label: "休息",  emoji: "😴" },
  { key: "win",     label: "成就",  emoji: "✨" },
  { key: "mind",    label: "心理",  emoji: "🌧️" },
];

// ── Shared button style ───────────────────────────────────────────────────────

const primaryBtn = "w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-opacity active:opacity-70";
const ghostBtn   = "w-full py-3 rounded-2xl text-[14px] font-medium text-[#C4ACB4] transition-opacity active:opacity-70";

// ── Main page ─────────────────────────────────────────────────────────────────

type TodayEntry = {
  id: number;
  mood: string;
  tags: string[] | null;
  ai_response: string | null;
  ai_personal_response: string | null;
  free_text: string | null;
};

export default function MoodPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
  const [isCheckingToday, setIsCheckingToday] = useState(true);
  const [todayEntry, setTodayEntry] = useState<TodayEntry | null>(null);

  useEffect(() => {
    const check = async () => {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
      const { data } = await supabase
        .from("mood_entries")
        .select("id, mood, tags, ai_response, ai_personal_response, free_text")
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setTodayEntry(data[0] as TodayEntry);
      setIsCheckingToday(false);
    };
    check();
  }, []);

  // Step 1 state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [aiMoodResponse, setAiMoodResponse] = useState("");
  const [isLoadingMood, setIsLoadingMood] = useState(false);

  // Step 2 state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 3 state
  const [freeText, setFreeText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Done state
  const [aiTextResponse, setAiTextResponse] = useState("");

  const recognitionRef = useRef<any>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

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
    setSelectedTags(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const r = new SR();
    r.lang = "zh-CN";
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onend   = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      setFreeText(prev => prev ? `${prev} ${t}` : t);
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
        const tagLabels = selectedTags.map(k => TAGS.find(t => t.key === k)?.label).filter(Boolean);
        const res = await fetch("/api/mood-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "text", mood: selectedMood, tags: tagLabels, text }),
        });
        const data = await res.json();
        personalResponse = data.response || "";
        setAiTextResponse(personalResponse);
      } catch { /* silent */ }
    }

    setIsLoadingText(false);
    setIsSaving(true);

    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
      const tagLabels = selectedTags.map(k => TAGS.find(t => t.key === k)?.label).filter(Boolean);
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
    setStep("done");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isCheckingToday) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF8F6" }}>
        <p className="text-[13px] text-[#C4ACB4] animate-pulse">加载中…</p>
      </div>
    );
  }

  if (todayEntry && step === 1) {
    return (
      <TodayAlreadyRecorded
        entry={todayEntry}
        onReRecord={() => setTodayEntry(null)}
        onHome={() => router.push("/")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F6" }}>
      {/* Back button */}
      {step !== "done" && (
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-5 text-[#C4ACB4] text-sm font-medium"
        >
          ← 返回
        </button>
      )}

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

      {step === "done" && (
        <DoneScreen
          selectedMood={selectedMood}
          aiTextResponse={aiTextResponse}
          onHome={() => router.push("/")}
        />
      )}
    </div>
  );
}

// ── Step 1: Mood selection ────────────────────────────────────────────────────

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

      {/* AI response */}
      {selectedMood && (
        <div className="mt-5 px-1">
          {isLoadingMood ? (
            <p className="text-[13px] text-[#C4ACB4] text-center animate-pulse">
              正在感受你的心情…
            </p>
          ) : aiMoodResponse ? (
            <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4]"
              style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
              <p className="text-[13px] text-[#7A5560] leading-relaxed">{aiMoodResponse}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-auto pt-6 space-y-2">
        {selectedMood && !isLoadingMood && (
          <button onClick={onNext} className={primaryBtn} style={{ background: "#D4788A" }}>
            继续 →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Tag selection ─────────────────────────────────────────────────────

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
        <button onClick={onNext} className={primaryBtn} style={{ background: "#D4788A" }}>
          继续 →
        </button>
        <button onClick={onSkip} className={ghostBtn}>跳过</button>
      </div>
    </div>
  );
}

// ── Step 3: Free text + voice ─────────────────────────────────────────────────

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

        {/* Mic button */}
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
            {isListening ? (
              <span className="text-white text-base leading-none">■</span>
            ) : (
              <span className="text-[#F28BA8] text-base leading-none">🎙️</span>
            )}
          </button>
        )}
      </div>

      {/* Listening indicator */}
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

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneScreen({
  selectedMood, aiTextResponse, onHome,
}: {
  selectedMood: string | null;
  aiTextResponse: string;
  onHome: () => void;
}) {
  const moodData = MOODS.find(m => m.key === selectedMood);
  const Face = moodData?.Face;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-5 pb-10 text-center">
      {Face && (
        <div className="mb-6" style={{ width: 80, height: 80 }}>
          <Face />
        </div>
      )}

      <h2 className="text-2xl font-bold text-[#3D2832] mb-2">记录完成 ✨</h2>
      <p className="text-[14px] text-[#9C8589] mb-6">今天的心情已经好好保存了～</p>

      {aiTextResponse && (
        <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4] mb-8 text-left w-full max-w-sm"
          style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
          <p className="text-[13px] text-[#7A5560] leading-relaxed">{aiTextResponse}</p>
        </div>
      )}

      <button
        onClick={onHome}
        className={primaryBtn}
        style={{ background: "#D4788A", maxWidth: 280 }}
      >
        回到首页
      </button>
    </div>
  );
}

// ── Today already recorded screen ─────────────────────────────────────────────

function TodayAlreadyRecorded({
  entry, onReRecord, onHome,
}: {
  entry: TodayEntry;
  onReRecord: () => void;
  onHome: () => void;
}) {
  const moodData = MOODS.find(m => m.key === entry.mood);
  const Face = moodData?.Face;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-20 pb-10" style={{ background: "#FFF8F6" }}>
      <button onClick={onHome} className="absolute top-12 left-5 text-[#C4ACB4] text-sm font-medium">
        ← 返回
      </button>

      <div className="flex flex-col items-center text-center">
        {Face && (
          <div className="mb-4" style={{ width: 72, height: 72 }}>
            <Face />
          </div>
        )}
        <h2 className="text-xl font-bold text-[#3D2832] mb-1">今天已经记录过啦 ✨</h2>
        <p className="text-[13px] text-[#9C8589]">今日心情：{moodData?.label}</p>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {entry.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-[12px] px-3 py-1 rounded-full font-medium"
              style={{ background: "#FDE8EE", color: "#F28BA8" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* AI responses */}
      <div className="mt-5 space-y-3">
        {entry.ai_response && (
          <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4]"
            style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
            <p className="text-[13px] text-[#7A5560] leading-relaxed">{entry.ai_response}</p>
          </div>
        )}
        {entry.free_text && (
          <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4]"
            style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
            <p className="text-[11px] text-[#C4ACB4] mb-1">你写道</p>
            <p className="text-[13px] text-[#3D2832] leading-relaxed">{entry.free_text}</p>
          </div>
        )}
        {entry.ai_personal_response && (
          <div className="bg-white rounded-2xl px-5 py-4 border border-[#F9D8E4]"
            style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)" }}>
            <p className="text-[13px] text-[#7A5560] leading-relaxed">{entry.ai_personal_response}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 space-y-2">
        <button onClick={onHome} className={primaryBtn} style={{ background: "#D4788A" }}>
          回到首页
        </button>
        <button onClick={onReRecord} className={ghostBtn}>再记录一次</button>
      </div>
    </div>
  );
}
