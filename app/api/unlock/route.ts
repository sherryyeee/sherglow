import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !checkPassword(password)) {
    // 放慢错误尝试，降低被暴力猜测的速度
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "密码不正确" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
