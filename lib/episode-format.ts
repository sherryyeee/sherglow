// 节目的时长、日期显示（服务端和浏览器都能用）
export function formatMinutes(sec: number | null) {
  return sec ? `${Math.max(1, Math.round(sec / 60))} 分钟` : null;
}

export function formatClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function dateLabel(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}月${Number(d)}日`;
}
