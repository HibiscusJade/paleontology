import { useState } from "react";
import PartyLayout from "../components/PartyLayout";
import { useLocation } from "wouter";

export default function SocietyAnnouncements() {
  const [activeCategory, setActiveFilter] = useState("全部公告");
  const [, setLocation] = useLocation();

  const categories = [
    { name: "全部公告", count: 42 },
    { name: "学术会议", count: 12 },
    { name: "奖励申报", count: 8 },
    { name: "组织工作", count: 15 },
    { name: "科普教育", count: 7 },
  ];

  const announcements = [
    {
      id: 1,
      isFeatured: true,
      category: "奖励申报",
      date: "2024-10-25",
      title: "关于开展2026年度“中国古生物学会科学技术奖”推荐及申报工作的通知",
      desc: "为贯彻落实国家关于科技奖励制度改革的要求，促进古生物学领域科技创新与发展，学会现启动2026年度“中国古生物学会科学技术奖”的推荐工作，详情请点击查看...",
      views: "1,248",
    },
    {
      id: 2,
      category: "学术会议",
      day: "15",
      month: "2024.10",
      title: "第三届亚洲古生物学大会（APC3）第二轮通知（中文版）",
      desc: "会议将于2025年夏季举行，现开放摘要提交通道及早期注册优惠。请各会员单位积极组织参加，探讨亚洲古生物学前沿进展...",
      code: "PSC-2024-082",
    },
    {
      id: 3,
      category: "组织工作",
      day: "02",
      month: "2024.10",
      title: "关于增补中国古生物学会第十三届理事会特邀理事的决定",
      desc: "经学会第十三届理事会常务理事会研究决定，同意增补以下专家为第十三届理事会特邀理事，进一步优化理事会结构...",
    },
    {
      id: 4,
      category: "科普教育",
      day: "28",
      month: "2024.09",
      title: "中国古生物学会2024年科普工作会议在南京顺利召开",
      desc: "会议围绕“新时代背景下的古生物科普创新”展开讨论，共有来自全国30余家基地的代表参会并分享经验...",
    },
  ];

  const filteredAnnouncements = activeCategory === "全部公告"
    ? announcements
    : announcements.filter(item => item.category === activeCategory);

  return (
    <PartyLayout currentPageTitle="会员公告">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-[#FCFAF7] border border-[#E5E1DA] p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-[#002B49] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#002B49] inline-block"></span> 公告分类
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => setActiveFilter(cat.name)}
                    className="w-full flex items-center justify-between py-3 px-2 rounded hover:bg-slate-100 transition-all text-left"
                  >
                    <span className={activeCategory === cat.name ? "font-bold text-[#002B49]" : "text-slate-600"}>
                      {cat.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeCategory === cat.name ? "bg-[#002B49] text-white" : "bg-[#E5E1DA] text-slate-600"
                    }`}>
                      {cat.count < 10 && cat.count > 0 ? `0${cat.count}` : cat.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#002B49] text-white p-6 rounded-lg relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">加入学会</h4>
              <p className="text-xs text-white/70 mb-6 leading-relaxed">成为中国古生物学会会员，获取最新行业资讯与学术资源。</p>
              <button 
                onClick={() => setLocation("/services?tab=branches")}
                className="bg-[#f5e0ba] text-[#241a03] px-6 py-2.5 rounded font-bold text-xs w-full hover:bg-[#d8c4a0] transition-all shadow-lg"
              >
                了解专业分会
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl opacity-5">account_balance</span>
          </div>
        </aside>

        {/* Right Content */}
        <section className="w-full lg:w-3/4">
          <div className="flex items-center justify-between mb-8 border-b border-[#E5E1DA] pb-4">
            <div className="flex gap-8">
              <button className="font-bold text-[#002B49] border-b-2 border-[#002B49] pb-4 relative -bottom-[17px]">最新发布</button>
              <button className="text-slate-500 hover:text-[#002B49] transition-colors pb-4">按热度</button>
            </div>
            <div className="text-slate-500 text-xs">
              <span>显示 1-{filteredAnnouncements.length} 条，共 {activeCategory === "全部公告" ? 42 : filteredAnnouncements.length} 条结果</span>
            </div>
          </div>

          {/* Announcement List */}
          <div className="space-y-6">
            {filteredAnnouncements.map((item) => {
              if (item.isFeatured) {
                return (
                  <div key={item.id} className="bg-white border-l-4 border-[#002B49] shadow-sm border-y border-r border-[#E5E1DA] p-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-red-50 text-red-600 px-3 py-1 text-[10px] font-bold tracking-wider rounded border border-red-100 uppercase">重要通知</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span> {item.date}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#002B49] group-hover:text-blue-800 mb-4 transition-colors leading-relaxed">
                      {item.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs font-bold text-[#765f42] px-3 py-1 bg-[#fadab7] rounded">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <span className="material-symbols-outlined text-[16px]">visibility</span> {item.views}
                        </span>
                      </div>
                      <span className="text-[#002B49] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        查看详情 <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="bg-white border border-[#E5E1DA] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer flex gap-8">
                  <div className="hidden md:flex flex-col items-center justify-center bg-slate-50 w-24 h-24 rounded border border-[#E5E1DA] shrink-0">
                    <span className="text-3xl font-bold text-[#002B49]">{item.day}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.month}</span>
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-lg font-bold text-[#002B49] group-hover:text-blue-800 mb-3 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{item.category}</span>
                      {item.code && (
                        <span className="text-[10px] text-slate-500 border-l border-[#E5E1DA] pl-4">文件编号: {item.code}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center gap-3">
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center rounded hover:bg-[#002B49] hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 bg-[#002B49] text-white flex items-center justify-center rounded font-bold">1</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center rounded hover:bg-slate-100 transition-colors">2</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center rounded hover:bg-slate-100 transition-colors">3</button>
            <span className="px-2 text-slate-500">...</span>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center rounded hover:bg-slate-100 transition-colors">8</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center rounded hover:bg-[#002B49] hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </PartyLayout>
  );
}
