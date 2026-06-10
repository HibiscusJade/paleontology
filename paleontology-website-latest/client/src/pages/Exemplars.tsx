import React, { useState } from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Exemplars() {
  const [activeTab, setActiveTab] = useState("scientists");

  const scientists = [
    {
      name: "李四光 院士",
      period: "1889 - 1971",
      role: "中国现代地质学与古生物学奠基人",
      desc: "著名科学家、教育家和社会活动家，我国地质之光。他一生致力于科学救国、科技报国，创立了地质力学，为中国石油工业的发展做出了跨时代的贡献。作为一名坚定的共产党员，他展现了科研报国、无私奉献的崇高风范。",
      quote: "真理，哪怕只见到一线微光，我们也要像飞蛾扑火一样向它飞去。"
    },
    {
      name: "顾知微 院士",
      period: "1918 - 2011",
      role: "中国著名地质古生物学家",
      desc: "中国科学院院士，我国中生代双壳类化石及地层研究的开拓者。他在大庆油田发现和黑龙江非海相白垩纪地层研究中做出了重大贡献。在长达数十年的科研生涯中，他始终以一名优秀共产党员的标准严格要求自己，严谨治学，奖掖后学。",
      quote: "科学研究是一场漫长的接力赛，每一代人都要跑好自己那一棒。"
    }
  ];

  const honors = [
    {
      title: "“优秀共产党员”荣誉称号",
      recipient: "刘杰 研究员（第一党支部）",
      date: "2025年7月",
      achievement: "刘杰同志长期致力于古无脊椎动物化石系统学研究，在国际学术期刊发表多篇高水平论文。作为支部书记，他创新‘党建+科普’模式，深入偏远山区中小学开展科普志愿服务，展现了新时代科研党员的先锋风采。"
    },
    {
      title: "“先进基层党组织”表彰",
      recipient: "中国古生物学会第二党支部",
      date: "2025年7月",
      achievement: "第二党支部积极贯彻‘党建强会’，将党建工作与重大科研项目攻关紧密结合。支部党员在青藏高原野外考察、地质剖面勘探中发挥战斗堡垒作用，顺利攻克多项地层对比难题，取得突破性科研成果。"
    }
  ];

  return (
    <PartyLayout currentPageTitle="先进典型">
      <div className="flex flex-col gap-6">
        {/* Header & Tabs */}
        <div className="border-b border-fossil-stone pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              先进典型与榜样力量
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              弘扬杰出科学家精神，展示学会优秀党员先锋风采与重大党建荣誉。
            </p>
          </div>
          <div className="flex gap-1.5 text-xs bg-paper-bright p-1 border border-fossil-stone rounded shrink-0">
            <button
              onClick={() => setActiveTab("scientists")}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === "scientists" ? "bg-primary text-white font-semibold" : "hover:bg-white text-primary"}`}
            >
              杰出科学家精神
            </button>
            <button
              onClick={() => setActiveTab("honors")}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === "honors" ? "bg-primary text-white font-semibold" : "hover:bg-white text-primary"}`}
            >
              重大荣誉表彰
            </button>
          </div>
        </div>

        {/* 1. Scientists Section */}
        {activeTab === "scientists" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="party-gradient text-white p-6 rounded shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-accent-gold font-bold text-sm tracking-widest uppercase">Scientist Spirit</span>
                <h3 className="text-lg font-bold">科学报国，薪火相传</h3>
                <p className="text-xs text-white/80 max-w-xl leading-relaxed mt-1">
                  老一辈古生物学家用双脚丈量祖国山河，用生命谱写科技报国的壮丽篇章。他们的科学精神和党性风范，是激励我们勇攀科学高峰的永恒动力。
                </p>
              </div>
              <span className="material-symbols-outlined text-[48px] text-accent-gold opacity-80 block shrink-0">military_tech</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scientists.map((sci, idx) => (
                <div key={idx} className="bg-white border border-fossil-stone rounded p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b border-fossil-stone pb-3">
                      <div>
                        <h4 className="text-base font-bold text-primary">{sci.name}</h4>
                        <p className="text-xs text-party-red font-semibold mt-1">{sci.role}</p>
                      </div>
                      <span className="text-[10px] bg-accent text-primary px-2 py-0.5 rounded font-bold">
                        {sci.period}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sci.desc}
                    </p>
                  </div>
                  <div className="bg-paper-bright border-l-4 border-accent-gold p-3 rounded text-xs italic text-primary font-medium">
                    “ {sci.quote} ”
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Honors Section */}
        {activeTab === "honors" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {honors.map((h, idx) => (
                <div key={idx} className="bg-white border border-fossil-stone rounded p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b border-fossil-stone pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-primary">{h.title}</h4>
                        <p className="text-xs text-party-red font-semibold mt-1">获得者：{h.recipient}</p>
                      </div>
                      <span className="text-[10px] bg-accent text-primary px-2 py-0.5 rounded font-bold">
                        {h.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.achievement}
                    </p>
                  </div>
                  <div className="flex justify-end border-t border-fossil-stone pt-3">
                    <button className="text-[11px] font-semibold text-primary hover:text-party-red flex items-center gap-0.5">
                      查看先锋事迹专访
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PartyLayout>
  );
}
