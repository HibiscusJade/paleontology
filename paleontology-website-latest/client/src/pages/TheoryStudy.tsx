import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function TheoryStudy() {
  const externalDatabases = [
    {
      name: "习近平系列重要讲话数据库",
      desc: "收录了党的十八大以来习近平总书记发表的系列重要讲话全文及解读。",
      url: "http://jhsjk.people.cn/",
      icon: "menu_book"
    },
    {
      name: "党史学习教育官网",
      desc: "全国党史学习教育权威官方平台，提供丰富的历史文献与多媒体学习资源。",
      url: "http://dangshi.people.cn/",
      icon: "history_edu"
    },
    {
      name: "共产党员网 - 党建资料库",
      desc: "中组部主办的权威党建资料库，涵盖最新党务工作指引、条例及党建研究。",
      url: "https://www.12371.cn/",
      icon: "library_books"
    }
  ];

  const regulations = [
    {
      title: "《中国共产党章程》",
      date: "2022年修改版",
      summary: "中国共产党的根本大法，是全党必须遵循的总规矩、总章程。"
    },
    {
      title: "《中国共产党纪律处分条例》",
      date: "2023年修订版",
      summary: "规范党组织和党员行为的党内重要纪律法规，是管党治党的重要利器。"
    },
    {
      title: "《中国共产党支部工作条例（试行）》",
      date: "2018年颁布",
      summary: "新时代党支部建设的基本遵循，推动基层党组织规范化、标准化建设。"
    }
  ];

  const partyKnowledge = [
    {
      q: "什么是“三会一课”制度？",
      a: "“三会一课”是指定期召开支部党员大会、支部委员会、党小组会，按时上好党课。这是健全党的组织生活，严格党员管理，加强党员教育的重要制度。"
    },
    {
      q: "党的六大纪律是什么？",
      a: "包括政治纪律、组织纪律、廉洁纪律、群众纪律、工作纪律、生活纪律。其中政治纪律是最重要、最根本、最关键的纪律。"
    },
    {
      q: "发展党员的“十六字”方针是什么？",
      a: "控制总量、优化结构、提高质量、发挥作用。要求在发展党员工作中严把入口关，注重质量，确保党员队伍的先进性和纯洁性。"
    }
  ];

  return (
    <PartyLayout currentPageTitle="理论学习专栏">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-party-red inline-block"></span>
            理论学习与思想引领
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            对接官方权威平台、精选党内重要法规制度、普及基础党务常识，打造线上党员学习阵地。
          </p>
        </div>

        {/* 1. External Database Connections */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
            <span className="material-symbols-outlined text-[20px] text-party-red">hub</span>
            权威学习数据库（官方外链）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {externalDatabases.map((db, idx) => (
              <a
                key={idx}
                href={db.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-fossil-stone hover:border-party-red p-5 rounded shadow-sm hover:shadow transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="material-symbols-outlined text-[28px] text-party-red group-hover:scale-110 transition-transform mb-3 block">
                    {db.icon}
                  </span>
                  <h4 className="text-xs font-bold text-primary group-hover:text-party-red mb-2">{db.name}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">{db.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-primary group-hover:text-party-red flex items-center gap-0.5">
                  访问官方平台
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* 2. Important Regulations */}
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
            <span className="material-symbols-outlined text-[20px] text-party-red">gavel</span>
            党内重要法规条例
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regulations.map((reg, idx) => (
              <div key={idx} className="bg-paper-bright border border-fossil-stone p-5 rounded flex flex-col justify-between hover:border-accent-gold transition-colors">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-primary">{reg.title}</h4>
                    <span className="text-[10px] bg-accent text-primary px-2 py-0.5 rounded font-bold">{reg.date}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{reg.summary}</p>
                </div>
                <button className="mt-4 text-[10px] font-bold text-primary hover:text-party-red flex items-center gap-0.5 border border-fossil-stone/80 bg-white py-1.5 rounded justify-center transition-colors">
                  查阅法规详情
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Basic Knowledge Q&A */}
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
            <span className="material-symbols-outlined text-[20px] text-party-red">quiz</span>
            基础党务知识普及
          </h3>
          <div className="flex flex-col gap-4">
            {partyKnowledge.map((item, idx) => (
              <div key={idx} className="bg-white border border-fossil-stone p-4 rounded flex flex-col gap-2 hover:border-accent-gold transition-colors">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-[10px]">问</span>
                  {item.q}
                </h4>
                <div className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2 pl-1">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-party-red flex items-center justify-center font-bold text-[10px] shrink-0">答</span>
                  <p className="pt-0.5">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PartyLayout>
  );
}
