export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import RecordClient from "@/components/RecordClient";

export default async function RecordPage() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const now = new Date();
  const sydneyDate = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  let todayStr = `${sydneyDate.getFullYear()}-${String(sydneyDate.getMonth() + 1).padStart(2, "0")}-${String(sydneyDate.getDate()).padStart(2, "0")}`;

  if (isDemo) {
    const demoDateRes = await supabase.from("growth_records").select("date").eq("is_demo", true).order("date", { ascending: false }).limit(1);
    if (demoDateRes.data?.[0]?.date) todayStr = demoDateRes.data[0].date;
  }

  const [recordsResult, glowResult] = await Promise.all([
    isDemo
      ? supabase.from("growth_records").select("id,category,content").eq("is_demo", true).eq("date", todayStr).order("created_at", { ascending: true })
      : supabase.from("growth_records").select("id,category,content").eq("date", todayStr).order("created_at", { ascending: true }),
    supabase.from("glow_daily").select("response").eq("date", todayStr).limit(1),
  ]);

  const initialRecords = (recordsResult.data ?? []) as { id: number; category: string; content: string }[];
  const initialGlowResponse = (glowResult.data?.[0] as { response?: string } | undefined)?.response ?? null;

  return (
    <RecordClient
      today={todayStr}
      initialRecords={initialRecords}
      initialGlowResponse={initialGlowResponse}
      isDemo={isDemo}
    />
  );
}
