"use client";

import { useState } from "react";

// ── Individual SVG face components ──────────────────────────────────────────

function FaceHappy() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="g-happy" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFE2EC" />
          <stop offset="58%"  stopColor="#FFC1D1" />
          <stop offset="100%" stopColor="#F098BC" />
        </radialGradient>
      </defs>
      {/* Sphere */}
      <circle cx="30" cy="30" r="27" fill="url(#g-happy)" />
      {/* Highlight */}
      <ellipse cx="21" cy="18" rx="11" ry="7" fill="rgba(255,255,255,0.28)" />
      {/* Eyes */}
      <circle cx="21.5" cy="25" r="3.2" fill="#C45878" />
      <circle cx="38.5" cy="25" r="3.2" fill="#C45878" />
      <circle cx="22.7" cy="23.7" r="1.1" fill="white" />
      <circle cx="39.7" cy="23.7" r="1.1" fill="white" />
      {/* Wide smile */}
      <path d="M17,33 Q30,46 43,33"
        stroke="#C45878" strokeWidth="2.7" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="12.5" cy="32" rx="5.5" ry="3.2" fill="rgba(240,110,155,0.26)" />
      <ellipse cx="47.5" cy="32" rx="5.5" ry="3.2" fill="rgba(240,110,155,0.26)" />
      {/* Sparkle */}
      <path d="M46,11 L47.2,14 L50.5,12.5 L47.2,15.2 L46,18.5 L44.8,15.2 L41.5,12.5 L44.8,14 Z"
        fill="#FFD37A" opacity="0.92" />
      <circle cx="43" cy="8" r="1.3" fill="#FFD37A" opacity="0.60" />
    </svg>
  );
}

function FaceCalm() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="g-calm" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFF2E0" />
          <stop offset="58%"  stopColor="#FFD9B3" />
          <stop offset="100%" stopColor="#F0B870" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#g-calm)" />
      <ellipse cx="21" cy="18" rx="11" ry="7" fill="rgba(255,255,255,0.25)" />
      {/* Closed peaceful eyes — arcs curving upward (˘ shape) */}
      <path d="M18,26 Q21.5,21.5 25,26"
        stroke="#A87040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M35,26 Q38.5,21.5 42,26"
        stroke="#A87040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Gentle smile */}
      <path d="M22,35 Q30,41.5 38,35"
        stroke="#A87040" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      {/* Warm blush */}
      <ellipse cx="12.5" cy="33" rx="5" ry="3" fill="rgba(240,165,90,0.22)" />
      <ellipse cx="47.5" cy="33" rx="5" ry="3" fill="rgba(240,165,90,0.22)" />
    </svg>
  );
}

function FaceNeutral() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="g-neutral" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFF8EE" />
          <stop offset="58%"  stopColor="#F7E7CE" />
          <stop offset="100%" stopColor="#DCC498" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#g-neutral)" />
      <ellipse cx="21" cy="18" rx="11" ry="7" fill="rgba(255,255,255,0.22)" />
      {/* Neutral eyes */}
      <ellipse cx="21.5" cy="25" rx="3.2" ry="3.5" fill="#8C7050" />
      <ellipse cx="38.5" cy="25" rx="3.2" ry="3.5" fill="#8C7050" />
      <circle cx="22.7" cy="23.8" r="1"   fill="white" />
      <circle cx="39.7" cy="23.8" r="1"   fill="white" />
      {/* Flat mouth */}
      <line x1="21" y1="37" x2="39" y2="37"
        stroke="#8C7050" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function FaceSad() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="g-sad" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#F8F0FF" />
          <stop offset="58%"  stopColor="#E7D4F7" />
          <stop offset="100%" stopColor="#BEA0DC" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#g-sad)" />
      <ellipse cx="21" cy="18" rx="11" ry="7" fill="rgba(255,255,255,0.22)" />
      {/* Tiny soft cloud — top left */}
      <ellipse cx="11" cy="14"   rx="4.5" ry="3"   fill="rgba(190,158,228,0.30)" />
      <ellipse cx="15" cy="12"   rx="3.5" ry="2.5" fill="rgba(190,158,228,0.30)" />
      <ellipse cx="18" cy="13.5" rx="3"   ry="2.2" fill="rgba(190,158,228,0.30)" />
      {/* Sad eyebrows */}
      <path d="M17.5,19.5 Q21,17.5 24.5,19"
        stroke="#8855B5" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <path d="M35.5,19 Q39,17.5 42.5,19.5"
        stroke="#8855B5" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="21.5" cy="26" rx="3.2" ry="3.5" fill="#7050A8" />
      <ellipse cx="38.5" cy="26" rx="3.2" ry="3.5" fill="#7050A8" />
      <circle cx="22.7" cy="24.8" r="1"  fill="white" />
      <circle cx="39.7" cy="24.8" r="1"  fill="white" />
      {/* Frown */}
      <path d="M20,40.5 Q30,34 40,40.5"
        stroke="#7050A8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Tiny teardrop */}
      <ellipse cx="40.5" cy="31" rx="1.4" ry="2.2" fill="rgba(160,125,220,0.42)" />
    </svg>
  );
}

function FaceTired() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="g-tired" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#EEF5FF" />
          <stop offset="58%"  stopColor="#D8E6FF" />
          <stop offset="100%" stopColor="#A8C0E8" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#g-tired)" />
      <ellipse cx="21" cy="18" rx="11" ry="7" fill="rgba(255,255,255,0.20)" />
      {/* Sleepy eyes — lower half visible + drooping eyelid arc on top */}
      <ellipse cx="21.5" cy="27" rx="3.8" ry="2.2" fill="#6070A8" />
      <path d="M17.5,25 Q21.5,21.5 25.5,25"
        stroke="#88A0C8" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <ellipse cx="38.5" cy="27" rx="3.8" ry="2.2" fill="#6070A8" />
      <path d="M34.5,25 Q38.5,21.5 42.5,25"
        stroke="#88A0C8" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {/* Tired mouth */}
      <path d="M22,38.5 Q30,35.5 38,38.5"
        stroke="#6070A8" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      {/* ZZZ — top right */}
      <path d="M43.5,12.5 L48.5,12.5 L43.5,17 L48.5,17"
        stroke="rgba(110,136,185,0.55)" strokeWidth="1.6" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46,8 L50,8 L46,11.5 L50,11.5"
        stroke="rgba(110,136,185,0.38)" strokeWidth="1.3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const MOODS = [
  { key: "happy",   label: "开心", ring: "#FFC1D1", glow: "rgba(255,193,209,0.55)", Face: FaceHappy },
  { key: "calm",    label: "平静", ring: "#FFD9B3", glow: "rgba(255,217,179,0.55)", Face: FaceCalm },
  { key: "neutral", label: "一般", ring: "#D8C8A8", glow: "rgba(247,231,206,0.55)", Face: FaceNeutral },
  { key: "sad",     label: "低落", ring: "#C8A8E8", glow: "rgba(231,212,247,0.55)", Face: FaceSad },
  { key: "tired",   label: "很累", ring: "#A8C0E8", glow: "rgba(216,230,255,0.55)", Face: FaceTired },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function MoodCheckin() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="px-5 mb-5">
      <p className="text-[13px] font-semibold text-[#3D2832] mb-3">
        今天的心情如何？
      </p>

      <div
        className="bg-white rounded-3xl py-5 px-3 border border-[#F9D8E4]"
        style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.07)" }}
      >
        <div className="flex justify-between items-start px-1">
          {MOODS.map((mood, i) => {
            const active = selected === i;
            const Face = mood.Face;
            return (
              <button
                key={mood.key}
                onClick={() => setSelected(active ? null : i)}
                className="flex flex-col items-center gap-2"
                style={{
                  transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: active ? "scale(1.14) translateY(-4px)" : "scale(1)",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: active
                      ? `0 0 0 2.5px ${mood.ring}, 0 8px 24px ${mood.glow}`
                      : "0 2px 10px rgba(0,0,0,0.07)",
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  <Face />
                </div>
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: active ? "#3D2832" : "#C4ACB4",
                    transition: "color 0.2s ease",
                  }}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <p
            className="text-center text-[11px] mt-4 font-medium"
            style={{ color: "#A89098" }}
          >
            已记录 · 今天感觉{MOODS[selected].label}，好好照顾自己 ✨
          </p>
        )}
      </div>
    </section>
  );
}
