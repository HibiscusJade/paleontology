import React from "react";
import PartyLayout from "../components/PartyLayout";

export default function DownloadsCenter() {
  const categories = ["全部资源", "管理办法", "学术标准", "年报资料"];
  
  const membershipFiles = [
    {
      title: "中国古生物学会个人会员申请表",
      date: "2023-10-15",
      format: "DOC",
      formatColor: "bg-[#fadab7] text-[#765f42]",
      size: "142 KB",
      icon: "description"
    },
    {
      title: "单位会员入会申请登记表",
      date: "2023-08-22",
      format: "PDF",
      formatColor: "bg-red-100 text-red-800",
      size: "156 KB",
      icon: "corporate_fare"
    },
    {
      title: "会员证补办申请单",
      date: "2023-05-10",
      format: "DOCX",
      formatColor: "bg-blue-100 text-blue-800",
      size: "88 KB",
      icon: "badge"
    }
  ];

  const regulations = [
    "中国古生物学会章程 (2022修订)",
    "学术会议管理暂行办法",
    "会费缴纳及使用管理规定"
  ];

  const academicReports = [
    "2023年度学术活动总结",
    "古生物名词审定标准手册",
    "学会分支机构考核办法"
  ];

  return (
    <PartyLayout currentPageTitle="资料下载">
      {/* Search and Categories Panel */}
      <div className="bg-slate-100 border border-[#E5E1DA] p-6 rounded-lg mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`px-6 py-2 text-sm font-bold whitespace-nowrap rounded transition-colors ${
                idx === 0 
                  ? "bg-[#002B49] text-white" 
                  : "bg-white border border-[#E5E1DA] text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E1DA] rounded focus:ring-1 focus:ring-[#002B49] text-sm" 
            placeholder="输入关键词搜索资料..." 
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Membership */}
          <div className="bg-white border border-[#E5E1DA] p-6 relative rounded shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#002B49] rounded-l"></div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E5E1DA]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#002B49] text-3xl">group_add</span>
                <h2 className="text-xl font-bold text-slate-800">会员申请与管理资料</h2>
              </div>
              <span className="text-slate-400 font-bold text-[10px] tracking-wider">MEMBERSHIP SERVICES</span>
            </div>
            <div className="divide-y divide-[#E5E1DA]">
              {membershipFiles.map((file, idx) => (
                <div key={idx} className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/item">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-lg text-[#002B49] group-hover/item:bg-[#002B49] group-hover/item:text-white transition-all">
                      <span className="material-symbols-outlined">{file.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover/item:text-blue-800 transition-colors">{file.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-400">发布日期: {file.date}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${file.formatColor}`}>{file.format}</span>
                        <span className="text-xs text-slate-400">{file.size}</span>
                      </div>
                    </div>
                  </div>
                  <a className="flex items-center gap-2 px-4 py-2 border border-[#002B49] text-[#002B49] hover:bg-[#002B49] hover:text-white transition-all text-xs font-bold rounded self-stretch sm:self-auto justify-center" href="#">
                    <span className="material-symbols-outlined text-sm">download</span> 点击下载
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Society Rules */}
            <div className="bg-white border border-[#E5E1DA] p-6 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-slate-600">gavel</span>
                <h3 className="text-lg font-bold text-slate-800">学会管理办法</h3>
              </div>
              <ul className="space-y-4">
                {regulations.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start border-b border-slate-100 pb-3 group">
                    <a className="text-sm text-slate-700 hover:text-[#002B49] transition-colors" href="#">{item}</a>
                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-[#002B49] transition-colors">download</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 text-[#002B49] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                查看更多 <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Academic Reports */}
            <div className="bg-white border border-[#E5E1DA] p-6 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-slate-600">analytics</span>
                <h3 className="text-lg font-bold text-slate-800">学术与年报</h3>
              </div>
              <ul className="space-y-4">
                {academicReports.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start border-b border-slate-100 pb-3 group">
                    <a className="text-sm text-slate-700 hover:text-[#002B49] transition-colors" href="#">{item}</a>
                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-[#002B49] transition-colors">download</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 text-[#002B49] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                查看更多 <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Quick Access Channels */}
          <div className="bg-[#002B49] p-6 text-white rounded shadow-lg">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">bolt</span> 快速通道
            </h3>
            <div className="space-y-4">
              {[
                { label: "学会章程", icon: "article" },
                { label: "缴费标准", icon: "payments" },
                { label: "申报流程", icon: "task" }
              ].map((link, idx) => (
                <a key={idx} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded group" href="#">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">{link.icon}</span>
                    <span className="text-sm">{link.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                </a>
              ))}
            </div>
          </div>

          {/* Library Stats */}
          <div className="bg-white border border-[#E5E1DA] p-6 rounded shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 tracking-wider mb-6">资源库概况</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 border border-[#E5E1DA] rounded">
                <p className="text-2xl font-bold text-[#002B49]">520+</p>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1">文件总量</p>
              </div>
              <div className="text-center p-4 bg-slate-50 border border-[#E5E1DA] rounded">
                <p className="text-2xl font-bold text-[#002B49]">15k</p>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1">本月下载</p>
              </div>
            </div>
          </div>

          {/* Help Desk */}
          <div className="bg-slate-100 border border-[#E5E1DA] p-6 rounded">
            <h4 className="font-bold text-slate-800 mb-3">需要帮助？</h4>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              如果您在下载过程中遇到任何技术问题，或未能找到所需资料，请联系学会秘书处。
            </p>
            <button className="w-full bg-[#002B49] text-white py-3 text-sm font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-2 rounded">
              <span className="material-symbols-outlined text-sm">mail</span> 咨询秘书处
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-[#002B49] py-12 text-white rounded-lg mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">加入中国古生物学会</h2>
        <p className="text-sm text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
          致力于古生物学研究、科普教育与学术交流，诚邀海内外相关领域专家及爱好者加入。
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-[#f5e0ba] text-[#241a03] px-10 py-3 text-sm font-bold hover:scale-105 transition-all rounded shadow-lg">立即在线申请</button>
          <button className="border border-white text-white px-10 py-3 text-sm font-bold hover:bg-white/10 transition-all rounded">会员章程</button>
        </div>
      </section>
    </PartyLayout>
  );
}
