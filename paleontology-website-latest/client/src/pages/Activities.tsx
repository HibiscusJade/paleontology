import React, { useState } from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Activities() {
  const [activeCategory, setActiveTab] = useState("all");

  const categories = [
    { id: "all", title: "全部生活" },
    { id: "election", title: "换届选举" },
    { id: "regular", title: "常态化组织生活" }
  ];

  const electionDocs = [
    { title: "中国古生物学会党委换届选举工作实施细则", size: "142 KB", type: "PDF" },
    { title: "基层党组织换届选举党员大会主持词（参考模板）", size: "45 KB", type: "DOCX" },
    { title: "支部委员会委员候选人预备人选名册表", size: "28 KB", type: "XLSX" }
  ];

  const regularActivities = [
    {
      id: 1,
      tag: "三会一课",
      title: "第一季度党员大会：深入研讨新时代地层学研究的政治站位与发展方向",
      date: "2026-05-20",
      desc: "会议集中学习了关于高水平科技自立自强的重要论述，结合学会地层古生物学科建设开展了专题讨论，明确了下一步重点攻关方向。",
      location: "学会第一会议室",
      host: "刘杰 书记"
    },
    {
      id: 2,
      tag: "主题党日",
      title: "“传承红色基因，探索生命起源”——赴南京地质古生物研究所陈列馆主题党日活动",
      date: "2026-05-12",
      desc: "党员们参观了李四光先生等老一辈科学家的办公室及手稿陈列，深刻领会了‘爱国、创新、求实、奉献、协同、育人’的科学家精神。",
      location: "南京地质古生物研究所",
      host: "张华 处长"
    },
    {
      id: 3,
      tag: "民主生活会",
      title: "2025年度党员领导干部民主生活会：对照检查与批评自我批评",
      date: "2026-04-30",
      desc: "班子成员紧密联系思想和工作实际，进行深刻的自我剖析，相互之间坦诚开展了批评，提出了明确的整改落实清单。",
      location: "学会党员活动室",
      host: "学会党委"
    },
    {
      id: 4,
      tag: "中心组学习",
      title: "党委中心组2026年第二次理论学习扩大会：专题研讨新质生产力与科研学术团体建设",
      date: "2026-04-15",
      desc: "邀请省委党校教授作专题辅导报告，中心组成员结合古生物学会如何服务国家战略资源勘探和科学普及进行了深度交流。",
      location: "学会主会议厅",
      host: "党委书记"
    }
  ];

  return (
    <PartyLayout currentPageTitle="组织生活">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              组织生活纪实
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              涵盖换届选举工作指引、三会一课、主题党日、民主生活会等常态化组织生活。
            </p>
          </div>
          <div className="flex gap-1.5 text-xs bg-paper-bright p-1 border border-fossil-stone rounded">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-1.5 rounded transition-all ${activeCategory === cat.id ? "bg-primary text-white font-semibold" : "hover:bg-white text-primary"}`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Election Section */}
        {(activeCategory === "all" || activeCategory === "election") && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
              <span className="material-symbols-outlined text-[20px] text-party-red">how_to_reg</span>
              换届选举规范与模板
            </h3>
            <div className="bg-paper-bright border border-fossil-stone rounded p-5 flex flex-col lg:flex-row gap-6">
              {/* Process Flow */}
              <div className="lg:w-7/12 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-primary">选举工作标准流程（五步法）</h4>
                <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3 bg-white border border-fossil-stone/60 p-2.5 rounded">
                    <span className="bg-party-red text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="font-semibold text-primary">起草请示</span>
                    <span>：提前1个月向上级党组织呈报换届选举请示。</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-fossil-stone/60 p-2.5 rounded">
                    <span className="bg-party-red text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                    <span className="font-semibold text-primary">酝酿人选</span>
                    <span>：民主推荐、酝酿并公示候选人预备人选。</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-fossil-stone/60 p-2.5 rounded">
                    <span className="bg-party-red text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                    <span className="font-semibold text-primary">大会选举</span>
                    <span>：召开党员大会，采取差额选举和无记名投票。</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-fossil-stone/60 p-2.5 rounded">
                    <span className="bg-party-red text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">4</span>
                    <span className="font-semibold text-primary">分工报批</span>
                    <span>：召开新一届委员会第一次会议，选举书记并分工。</span>
                  </div>
                </div>
              </div>

              {/* Template Downloads */}
              <div className="lg:w-5/12 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-fossil-stone pt-4 lg:pt-0 lg:pl-6">
                <h4 className="text-xs font-bold text-primary">配套官方文件与表格模板</h4>
                <div className="flex flex-col gap-2">
                  {electionDocs.map((doc, idx) => (
                    <div key={idx} className="bg-white border border-fossil-stone/60 p-3 rounded flex items-center justify-between hover:border-party-red transition-colors group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-party-red text-[20px] shrink-0">draft</span>
                        <span className="text-xs text-primary font-medium truncate group-hover:text-party-red">{doc.title}</span>
                      </div>
                      <span className="text-[10px] bg-accent text-primary font-bold px-1.5 py-0.5 rounded shrink-0 ml-2">
                        {doc.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Regular Activities Section */}
        {(activeCategory === "all" || activeCategory === "regular") && (
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
              <span className="material-symbols-outlined text-[20px] text-party-red">groups</span>
              常态化组织生活纪实
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {regularActivities.map((act) => (
                <div key={act.id} className="bg-white border border-fossil-stone rounded p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] bg-accent text-primary font-bold px-2 py-0.5 rounded border border-accent-gold/20">
                        {act.tag}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {act.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-primary mb-2 line-clamp-1 group-hover:text-party-red transition-colors cursor-pointer">
                      {act.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {act.desc}
                    </p>
                  </div>
                  <div className="bg-paper-bright border border-fossil-stone p-3 rounded flex flex-wrap justify-between items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-party-red">location_on</span>
                      {act.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-party-red">person</span>
                      召集人：{act.host}
                    </span>
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
