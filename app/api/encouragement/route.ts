import { NextRequest, NextResponse } from "next/server";
import { isDemo, isUnlocked } from "@/lib/auth";
import { generateEncouragement } from "@/lib/encouragement";

// "换一张"：解锁后让 AI 重新写一句。Demo 站和未解锁时在浏览器里从语录库换，不走这里。
export async function POST(req: NextRequest) {
  if (isDemo()) return NextResponse.json({ error: "Demo 模式不支持" }, { status: 403 });
  if (!(await isUnlocked())) return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const { avoid } = await req.json().catch(() => ({ avoid: undefined }));
  try {
    return NextResponse.json(await generateEncouragement(typeof avoid === "string" ? avoid : undefined));
  } catch {
    return NextResponse.json({ error: "生成失败" }, { status: 502 });
  }
}
