import { createClient } from "@supabase/supabase-js";

// 仅在服务器端使用：日记、成长记录等私人数据只能经由这里读写。
// SUPABASE_SERVICE_KEY 没有 NEXT_PUBLIC_ 前缀，不会被打包进浏览器。
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("缺少 SUPABASE_SERVICE_KEY 环境变量");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}
