import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// 日记密码锁：单用户。密码和签名密钥都在服务器环境变量里，浏览器只拿到一个签名过的 cookie。
const COOKIE = "glow_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

export const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("缺少 SESSION_SECRET 环境变量");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  const expected = process.env.DIARY_PASSWORD;
  if (!expected) throw new Error("缺少 DIARY_PASSWORD 环境变量");
  return safeEqual(input, expected);
}

export async function createSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}

export async function isUnlocked() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(expires));
}

// Demo 站展示示例数据，不需要密码；主站必须先解锁。
export async function canViewPrivate() {
  return isDemo() || (await isUnlocked());
}
