import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Work() {
  const plans = [
    {
      year: "2026年度",
      title: "中国古生物学会2026年党建工作要点与部署安排",
      status: "进行中",
      statusColor: "bg-green-100 text-green-800 border-green-200",
      summary: "围绕‘党建强会’战略，聚焦思想政治引领、组织规范化建设、科学家精神弘扬三大核心任务，开展6项专项行动，推动党建与科研学术深度融合。",
      tasks: [
        "开展‘不忘初心，科技报国’主题学习实践活动，覆盖全体会员支部；",
        "实施‘青年学者成长护航计划’，建立党员科学家对青年学者的双向帮扶机制；",
        "开展党纪学习教育，健全党风廉政风险防范与学术诚信机制。"
      ]
    },
    {
      year: "2025年度",
      title: "中国古生物学会2025年度党建工作总结与成效汇报",
      status: "已完成",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
      summary: "全面落实党建责任制，顺利完成学会党委换届选举，开展了建党周年系列科普研学活动，获上级党组织‘先进基层党组织’称号。",
      tasks: [
        "圆满完成第十三届党委换届选举，优化了班子成员结构；",
        "组织红色科普研学活动12场，服务公众及党员群众超5000人次；",
        "规范化整理并公示了2025年度党费收缴与使用管理账目。"
      ]
    }
  ];

  const deployments = [
    {
      title: "阶段性党建任务部署",
      icon: "assignment_turned_in",
      items: [
        { name: "第二季度理论学习部署", desc: "重点学习最新关于科技创新的重要论述，各支部需在6月底前提交学习报告。" },
        { name: "党员发展专项审核", desc: "对今年拟转正的5名预备党员进行档案交叉审核和政治审查公示。" }
      ]
    },
    {
      title: "专项整治与作风建设",
      icon: "verified",
      items: [
        { name: "科研经费合规使用专项整治", desc: "配合财务部门对近三年学会承接的科研项目经费进行抽查审计，坚决杜绝微腐败。" },
        { name: "‘形式主义’专项清理行动", desc: "精简党务会议与表格填报，让科研党员将更多精力投入到核心学术研究中。" }
      ]
    },
    {
      title: "党建责任制落实情况",
      icon: "shield_person",
      items: [
        { name: "党支部书记抓党建述职评议", desc: "每年底召开述职大会，由党委对各支部书记履职情况进行民主评议与等级评定。" },
        { name: "‘一岗双责’清单化管理", desc: "明确学会党委班子成员的学术与党建双重责任，签订党建目标责任书。" }
      ]
    }
  ];

  return (
    <PartyLayout currentPageTitle="党建工作">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-party-red inline-block"></span>
            党建工作部署与落实
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            集中展示学会年度工作要点、阶段性任务部署、专项整治行动及党建责任制落实成效。
          </p>
        </div>

        {/* Annual Work Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
            <span className="material-symbols-outlined text-[20px] text-party-red">calendar_today</span>
            年度党建工作要点
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className="bg-white border border-fossil-stone rounded p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-party-red bg-accent px-2.5 py-1 rounded">
                      {plan.year}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${plan.statusColor}`}>
                      {plan.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-primary mb-2 line-clamp-1 hover:text-party-red cursor-pointer">
                    {plan.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {plan.summary}
                  </p>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-primary">核心举措：</span>
                    {plan.tasks.map((task, tIdx) => (
                      <p key={tIdx} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                        <span className="text-party-red font-bold text-[10px] shrink-0 mt-0.5">•</span>
                        <span>{task}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <button className="mt-4 text-xs font-semibold text-primary hover:text-party-red flex items-center justify-center gap-0.5 border border-fossil-stone hover:border-party-red py-2 rounded transition-all bg-paper-bright">
                  查看完整部署文件
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Deployments & Special Tasks */}
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
            <span className="material-symbols-outlined text-[20px] text-party-red">assignment</span>
            阶段任务与专项整治
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deployments.map((dep, index) => (
              <div key={index} className="bg-paper-bright border border-fossil-stone rounded p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-fossil-stone/60">
                  <span className="material-symbols-outlined text-[22px] text-party-red block">{dep.icon}</span>
                  <h4 className="text-xs font-bold text-primary">{dep.title}</h4>
                </div>
                <div className="flex flex-col gap-4">
                  {dep.items.map((item, iIdx) => (
                    <div key={iIdx} className="bg-white border border-fossil-stone/60 p-3 rounded flex flex-col gap-1">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-party-red rounded-full"></span>
                        {item.name}
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PartyLayout>
  );
}
