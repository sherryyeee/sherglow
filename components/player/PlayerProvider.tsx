"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { EpisodeSummary } from "@/lib/episodes";
import { dateLabel } from "@/lib/episode-format";

// 全站唯一的播放器：切换页面时继续播放，底部显示迷你播放条，锁屏界面显示标题和控制按钮。
type PlayerState = {
  current: EpisodeSummary | null;
  playing: boolean;
  time: number;
  duration: number;
  rate: number;
  play: (episode: EpisodeSummary) => void;
  toggle: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  setRate: (rate: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const progressKey = (date: string) => `glow-progress-${date}`;

export function readProgress(date: string) {
  try {
    return Number(localStorage.getItem(progressKey(date)) ?? 0);
  } catch {
    return 0;
  }
}

function saveProgress(date: string, time: number, duration: number) {
  try {
    // 听到最后 10 秒内算听完，记为 -1
    localStorage.setItem(progressKey(date), String(duration && time >= duration - 10 ? -1 : Math.floor(time)));
  } catch {
    /* 隐私模式等情况下忽略 */
  }
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer 必须在 PlayerProvider 内使用");
  return ctx;
}

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingSeek = useRef(0); // 上次听到的位置，等音频信息加载后再跳过去
  const [current, setCurrent] = useState<EpisodeSummary | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);

  const play = useCallback((episode: EpisodeSummary) => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;
    if (current?.date !== episode.date) {
      audio.src = episode.audioUrl;
      const saved = readProgress(episode.date);
      pendingSeek.current = saved > 0 ? saved : 0;
      audio.playbackRate = rate;
      setCurrent(episode);
      setTime(saved > 0 ? saved : 0);
      setDuration(episode.durationSec ?? 0);
    }
    audio.play().catch(() => setPlaying(false));
  }, [current, rate]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min(t, audio.duration || t));
  }, []);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (audio) seek(audio.currentTime + delta);
  }, [seek]);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }, []);

  // 锁屏 / 控制中心显示的标题和按钮
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.headline,
      artist: `SherGlow AI 日报 · ${dateLabel(current.date)}`,
      artwork: [{ src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
    navigator.mediaSession.setActionHandler("seekto", (d) => d.seekTime !== undefined && seek(d.seekTime));
  }, [current, seek, skip]);

  return (
    <PlayerContext.Provider value={{ current, playing, time, duration, rate, play, toggle, seek, skip, setRate }}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          if (current && audioRef.current) saveProgress(current.date, audioRef.current.currentTime, audioRef.current.duration);
        }}
        onEnded={() => current && saveProgress(current.date, duration, duration)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (pendingSeek.current) {
            e.currentTarget.currentTime = pendingSeek.current;
            pendingSeek.current = 0;
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setTime(t);
          if (current && Math.floor(t) % 5 === 0) saveProgress(current.date, t, e.currentTarget.duration);
        }}
      />
    </PlayerContext.Provider>
  );
}

// 底部迷你播放条：在导航栏上方，有节目在播（或暂停中）时显示
export function MiniPlayer() {
  const { current, playing, time, duration, toggle } = usePlayer();
  if (!current) return null;
  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  return (
    <div className="fixed left-0 right-0 z-40" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="max-w-lg mx-auto px-3 pb-2">
        <div className="relative bg-white rounded-2xl border border-[#F9D8E4] overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(242,139,168,0.15)" }}>
          <div className="absolute top-0 left-0 h-[2px] bg-[#F28BA8]" style={{ width: `${pct}%` }} />
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Link href={`/news/${current.date}`} className="flex-1 min-w-0">
              <p className="text-[11px] text-[#C4ACB4]">AI 日报 · {dateLabel(current.date)}</p>
              <p className="text-[13px] font-medium text-[#3D2832] truncate">{current.headline}</p>
            </Link>
            <button onClick={toggle} aria-label={playing ? "暂停" : "播放"}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-70"
              style={{ background: "#FDE8EE" }}>
              {playing ? <Pause size={16} color="#C4607A" fill="#C4607A" /> : <Play size={16} color="#C4607A" fill="#C4607A" className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 页面底部留白，避免最后的内容被迷你播放条挡住
export function PlayerSpacer() {
  const { current } = usePlayer();
  return current ? <div className="h-16" /> : null;
}
