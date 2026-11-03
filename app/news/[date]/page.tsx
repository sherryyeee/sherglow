export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { getEpisode, type EpisodeArticle } from "@/lib/episodes";
import { dateLabel, formatMinutes } from "@/lib/episode-format";
import EpisodePlayer from "@/components/player/EpisodePlayer";

export default async function EpisodePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const episode = await getEpisode(date);
  if (!episode) notFound();

  const meta = [`${episode.articleCount} 条新闻`, formatMinutes(episode.durationSec)].filter(Boolean).join(" · ");

  return (
    <div className="min-h-full pb-6">
      <header className="px-5 pt-12 pb-4">
        <Link href="/news" className="inline-flex items-center gap-0.5 text-[13px] text-[#C4ACB4] mb-3">
          <ChevronLeft size={16} /> 全部节目
        </Link>
        <p className="text-[12px] font-semibold text-[#D4788A] mb-1">AI 日报 · {dateLabel(episode.date)}</p>
        <h1 className="text-[20px] font-bold text-[#3D2832] leading-snug">{episode.headline}</h1>
        <p className="text-[12px] text-[#A89098] mt-1.5">{meta}</p>
      </header>

      {episode.audioUrl && (
        <div className="px-5 mb-5">
          <EpisodePlayer episode={episode} />
        </div>
      )}

      <section className="px-5">
        <h2 className="text-[13px] font-semibold text-[#A89098] mb-2">文字版</h2>
        <div className="space-y-2.5">
          {episode.articles.map((article, i) => (
            <ArticleCard key={i} index={i} article={article} />
          ))}
        </div>

        {episode.observation && (
          <div className="rounded-2xl px-4 py-3.5 mt-4" style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
            <p className="text-[12px] font-semibold text-[#C4607A] mb-1">今日判断</p>
            <p className="text-[13px] text-[#6B3050] leading-relaxed">{episode.observation}</p>
          </div>
        )}
      </section>
    </div>
  );
}

// 每条新闻默认只显示标题和一句话，点开看关键事实、三点洞察和来源
function ArticleCard({ article, index }: { article: EpisodeArticle; index: number }) {
  const label = [article.region, article.category, article.industry].filter(Boolean).join(" · ");
  const lead = article.what_happened ?? article.summary;
  return (
    <details className="group bg-white rounded-2xl border border-[#F9D8E4]" style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.06)" }}>
      <summary className="list-none cursor-pointer px-4 py-3.5 flex items-start gap-3 [&::-webkit-details-marker]:hidden">
        <span className="text-[12px] font-bold text-[#F28BA8] mt-0.5">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#3D2832] leading-snug">{article.title}</p>
          {label && <p className="text-[11px] text-[#C4ACB4] mt-1">{label}</p>}
        </div>
        <ChevronDown size={16} color="#C4ACB4" className="mt-1 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 pl-10 space-y-3 text-[13px] leading-relaxed text-[#5C4650]">
        {lead && <p>{lead}</p>}
        {article.key_facts && article.key_facts.length > 0 && (
          <ul className="list-disc pl-4 space-y-1">
            {article.key_facts.map((fact, i) => <li key={i}>{fact}</li>)}
          </ul>
        )}
        {article.insights && article.insights.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-[#C4607A] mb-1">为什么值得关注</p>
            <ol className="list-decimal pl-4 space-y-1">
              {article.insights.map((text, i) => <li key={i}>{text}</li>)}
            </ol>
          </div>
        )}
        {article.sources.length > 0 && (
          <p className="text-[12px] text-[#A89098]">
            来源：
            {article.sources.map((s, i) => (
              <span key={i}>
                {i > 0 && "；"}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#F28BA8]">{s.name}</a>
                {s.published_date && ` · ${dateLabel(s.published_date)}`}
              </span>
            ))}
          </p>
        )}
      </div>
    </details>
  );
}
