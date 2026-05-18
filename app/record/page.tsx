export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import RecordClient from "@/components/RecordClient";

export default async function RecordPage() {
  const now = new Date();
  const sydneyDate = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  const todayStr = `${sydneyDate.getFullYear()}-${String(sydneyDate.getMonth() + 1).padStart(2, "0")}-${String(sydneyDate.getDate()).padStart(2, "0")}`;

  const [recordsResult, glowResult] = await Promise.all([
    supabase.from("growth_records").select("id,category,content").eq("date", todayStr).order("created_at", { ascending: true }),
    supabase.from("glow_daily").select("response").eq("date", todayStr).limit(1),
  ]);

  const initialRecords = (recordsResult.data ?? []) as { id: number; category: string; content: string }[];
  const initialGlowResponse = (glowResult.data?.[0] as { response?: string } | undefined)?.response ?? null;

  return (
    <RecordClient
      today={todayStr}
      initialRecords={initialRecords}
      initialGlowResponse={initialGlowResponse}
    />
  );
}
