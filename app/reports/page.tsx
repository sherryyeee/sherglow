export default function ReportsPage() {
  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">研报 📊</h1>
        <p className="text-xs text-[#9C8589] mt-1">每周 AI 行业研报精选</p>
      </header>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-full bg-[#D4788A] text-white text-xs font-medium">
            最新
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white border border-[#F9E8EC] text-[#9C8589] text-xs font-medium">
            历史
          </button>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F9E8EC] flex flex-col items-center text-center gap-3 py-12">
          <span className="text-5xl">📊</span>
          <p className="text-base font-semibold text-[#3D2832]">研报即将上线</p>
          <p className="text-sm text-[#9C8589] leading-relaxed max-w-xs">
            连接 AI Agent 后，每周二、周五的行业研报摘要将在这里展示，并支持按日期查看历史记录。
          </p>
        </div>
      </div>
    </div>
  );
}
