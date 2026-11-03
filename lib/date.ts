// 全站统一使用北京时间：日记按哪天算、问候语、每日语录都以此为准。
export const TIME_ZONE = "Asia/Shanghai";

// 北京日期，格式 YYYY-MM-DD；daysAgo 用于"昨天"等
export function beijingDate(daysAgo = 0, from = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(from.getTime() - daysAgo * 86400000));
}

// 北京时间的各个部分：月、日、星期（0=周日）、小时
export function beijingParts(from = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, month: "numeric", day: "numeric", weekday: "short", hour: "numeric", hourCycle: "h23",
  }).formatToParts(from);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
    hour: Number(get("hour")),
  };
}

// 时间戳显示为北京时间 HH:mm
export function beijingTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false,
  });
}
