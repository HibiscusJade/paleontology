import React from "react";
import PartyLayout from "../components/PartyLayout";

export default function International() {
  const articles = [
    {
      category: "国际合作",
      tagColor: "bg-[#fadab7] text-[#765f42]",
      date: "2024-05-12",
      title: "中日两国古生物学会签署合作备忘录",
      desc: "中国古生物学会与日本古生物学会代表在南京正式签署了学术合作备忘录，双方将在化石保护、人才培养及学术出版等领域开展深度合作。",
    },
    {
      category: "重要报告",
      tagColor: "bg-[#f5e0ba] text-[#241a03]",
      date: "2024-03-20",
      title: "第四届国际古生物学大会总结报告",
      desc: "本次大会吸引了来自全球50多个国家的逾千名专家参加，会议期间发布了关于白垩纪生物大灭绝的多项重磅研究成果。",
    },
    {
      category: "政策解析",
      tagColor: "bg-[#E5E1DA] text-slate-700",
      date: "2023-11-15",
      title: "国际交流中的化石标本出入境政策解析",
      desc: "为规范国际合作研究中的标本往来，学会邀请海关及自然资源部专家对最新的化石出入境法律法规进行了解读。",
    },
    {
      category: "科考动态",
      tagColor: "bg-[#fadab7] text-[#765f42]",
      date: "2023-08-05",
      title: "中英联合科考队在新疆地区的新发现",
      desc: "由中国古生物学会协调，中英联合考察组在准噶尔盆地发现了具有重要学术价值的早白垩世脊椎动物群落。",
    },
  ];

  return (
    <PartyLayout currentPageTitle="国际交流">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Navigation Sidebar */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-40 space-y-6">
            <div className="border border-[#E5E1DA] bg-white overflow-hidden rounded">
              <div className="bg-[#002B49] text-white px-6 py-4 font-bold text-lg border-b border-primary">
                服务指南
              </div>
              <nav className="flex flex-col">
                <a className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between hover:bg-slate-50 transition-colors group" href="#">
                  <span className="text-sm">科普活动</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                </a>
                <a className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between hover:bg-slate-50 transition-colors group" href="#">
                  <span className="text-sm">学术会议</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                </a>
                <a className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between bg-slate-100 text-[#002B49] font-bold" href="#">
                  <span className="text-sm">国际交流</span>
                  <span className="material-symbols-outlined text-xs">circle</span>
                </a>
                <a className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between hover:bg-slate-50 transition-colors group" href="#">
                  <span className="text-sm">表彰奖励</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                </a>
                <a className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group" href="#">
                  <span className="text-sm">资料下载</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                </a>
              </nav>
            </div>
            <div className="p-6 bg-slate-100 border-l-4 border-[#002B49] rounded">
              <h4 className="font-bold text-slate-800 mb-3">联系国际合作处</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">如果您有关于国际会议、出访交流 or 合作办展的咨询，请联系我们。</p>
              <a className="text-[#002B49] font-bold text-xs flex items-center gap-2 hover:underline" href="mailto:intl@chinapsc.cn">
                <span className="material-symbols-outlined text-base">mail</span> intl@chinapsc.cn
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content: News List */}
        <section className="w-full lg:w-3/4">
          <div className="mb-8 flex justify-between items-center border-b-2 border-[#002B49] pb-4">
            <h2 className="text-2xl font-bold text-[#002B49]">国际交流动态</h2>
            <div className="flex gap-4">
              <select className="bg-white border border-[#E5E1DA] text-xs px-3 py-1.5 focus:ring-1 focus:ring-[#002B49] rounded">
                <option>所有年份</option>
                <option>2024年</option>
                <option>2023年</option>
              </select>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-[#E5E1DA] border-t border-[#E5E1DA]">
            {articles.map((art, idx) => (
              <article key={idx} className="py-6 flex flex-col md:flex-row gap-6 items-start hover:bg-slate-50 transition-all duration-200 group px-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded-sm ${art.tagColor}`}>{art.category}</span>
                    <time className="text-xs text-slate-500 font-medium">{art.date}</time>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-slate-800 group-hover:text-blue-800 transition-colors cursor-pointer leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {art.desc}
                  </p>
                  <div className="mt-4">
                    <a className="text-[#002B49] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all" href="#">
                      查看全文 <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <nav className="flex items-center justify-center gap-2 mt-12">
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center hover:bg-slate-100 transition-colors rounded">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 border border-[#002B49] bg-[#002B49] text-white flex items-center justify-center font-bold rounded">1</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center font-bold hover:bg-slate-100 transition-colors rounded">2</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center font-bold hover:bg-slate-100 transition-colors rounded">3</button>
            <span className="px-2 text-slate-500">...</span>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center font-bold hover:bg-slate-100 transition-colors rounded">12</button>
            <button className="w-10 h-10 border border-[#E5E1DA] flex items-center justify-center hover:bg-slate-100 transition-colors rounded">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </section>
      </div>

      {/* Cooperation Partners Section */}
      <section className="bg-[#002B49] py-12 relative overflow-hidden rounded-lg mt-16">
        <div className="relative z-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-8">全球学术伙伴</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70 hover:opacity-100 transition-opacity duration-500 items-center justify-items-center max-w-4xl mx-auto">
            <div className="text-xl font-bold border border-white/20 px-6 py-3 rounded w-36">IPA</div>
            <div className="text-xl font-bold border border-white/20 px-6 py-3 rounded w-36">UNESCO</div>
            <div className="text-xl font-bold border border-white/20 px-6 py-3 rounded w-36">IUGS</div>
            <div className="text-xl font-bold border border-white/20 px-6 py-3 rounded w-36">PALASS</div>
          </div>
        </div>
      </section>
    </PartyLayout>
  );
}
