import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Announcements() {
  const announcements = [
    {
      id: 1,
      tag: "重要批示",
      title: "关于认真学习贯彻习近平总书记在两院院士大会上重要讲话精神的通知",
      date: "2026-05-28",
      org: "学会党委",
      important: true,
    },
    {
      id: 2,
      tag: "巡视巡察",
      title: "中共中国古生物学会委员会关于开展2026年第一轮内部巡察工作的公告",
      date: "2026-05-15",
      org: "学会纪委",
      important: false,
    },
    {
      id: 3,
      tag: "党内选举",
      title: "中国古生物学会第十三届理事会党委换届选举结果公示",
      date: "2026-05-10",
      org: "换届选举委员会",
      important: true,
    },
    {
      id: 4,
      tag: "党务通知",
      title: "关于交纳2026年度上半年党费的通知及标准公示",
      date: "2026-05-01",
      org: "党群工作处",
      important: false,
    },
    {
      id: 5,
      tag: "各类公示",
      title: "中国古生物学会2025年度‘优秀共产党员’拟表彰对象公示名单",
      date: "2026-04-25",
      org: "党群工作处",
      important: false,
    },
    {
      id: 6,
      tag: "党务通知",
      title: "关于召开2026年第二季度党委中心组（扩大）理论学习会议的通知",
      date: "2026-04-18",
      org: "学会党委",
      important: false,
    }
  ];

  return (
    <PartyLayout currentPageTitle="通知公告">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-party-red inline-block"></span>
            通知公告列表
          </h2>
          <span className="text-xs text-muted-foreground">共 {announcements.length} 条公告</span>
        </div>

        {/* Filter and search options placeholder */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-paper-bright p-3 border border-fossil-stone rounded">
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1 bg-primary text-white font-semibold rounded cursor-pointer">全部</span>
            <span className="px-3 py-1 bg-white border border-fossil-stone text-primary rounded hover:bg-white/80 cursor-pointer">重要批示</span>
            <span className="px-3 py-1 bg-white border border-fossil-stone text-primary rounded hover:bg-white/80 cursor-pointer">巡视巡察</span>
            <span className="px-3 py-1 bg-white border border-fossil-stone text-primary rounded hover:bg-white/80 cursor-pointer">党内选举</span>
            <span className="px-3 py-1 bg-white border border-fossil-stone text-primary rounded hover:bg-white/80 cursor-pointer">党务通知</span>
          </div>
          <div className="relative text-xs w-full sm:w-auto mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="搜索公告标题..."
              className="border border-fossil-stone rounded px-3 py-1.5 pr-8 w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="material-symbols-outlined absolute right-2.5 top-2 text-muted-foreground text-[16px]">search</span>
          </div>
        </div>

        {/* Announcements List */}
        <div className="flex flex-col gap-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-fossil-stone hover:border-party-red rounded p-4 transition-all shadow-sm hover:shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div className="flex items-start gap-3 flex-grow">
                <span className="material-symbols-outlined text-party-red mt-0.5 group-hover:scale-110 transition-transform">
                  {item.important ? "campaign" : "description"}
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      item.important
                        ? "bg-party-red text-white"
                        : "bg-accent text-primary"
                    }`}>
                      {item.tag}
                    </span>
                    {item.important && (
                      <span className="text-[10px] bg-red-100 text-party-red px-1.5 py-0.5 rounded font-bold border border-party-red/20">
                        置顶重要
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-primary group-hover:text-party-red transition-colors leading-relaxed cursor-pointer">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">domain</span>
                      {item.org}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-xs font-semibold text-primary hover:text-party-red flex items-center gap-0.5 self-end sm:self-center border border-fossil-stone hover:border-party-red px-3 py-1.5 rounded transition-all bg-paper-bright group-hover:bg-accent">
                查看详情
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4 text-xs">
          <button className="p-2 border border-fossil-stone rounded hover:bg-paper-bright disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[16px] block">chevron_left</span>
          </button>
          <span className="px-3 py-1.5 bg-primary text-white font-semibold rounded">1</span>
          <span className="px-3 py-1.5 border border-fossil-stone text-primary rounded hover:bg-paper-bright cursor-pointer">2</span>
          <button className="p-2 border border-fossil-stone rounded hover:bg-paper-bright">
            <span className="material-symbols-outlined text-[16px] block">chevron_right</span>
          </button>
        </div>
      </div>
    </PartyLayout>
  );
}
