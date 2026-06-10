import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Downloads() {
  const templates = [
    {
      category: "发展党员常用模板",
      icon: "person_add",
      items: [
        { title: "中国共产党入党申请书标准格式与撰写指引", size: "32 KB", format: "DOCX", count: 420 },
        { title: "思想汇报撰写要求及参考范文（季度汇报）", size: "28 KB", format: "DOCX", count: 315 },
        { title: "预备党员转正申请书标准模板及填写规范", size: "35 KB", format: "DOCX", count: 280 },
        { title: "入党志愿书（草稿样表）及填写说明", size: "112 KB", format: "PDF", count: 195 }
      ]
    },
    {
      category: "党务管理工作表单",
      icon: "folder_managed",
      items: [
        { title: "中国古生物学会党员组织关系转出介绍信登记表", size: "24 KB", format: "DOCX", count: 125 },
        { title: "党支部‘三会一课’会议记录及考勤样表", size: "45 KB", format: "DOCX", count: 210 },
        { title: "民主评议党员民主测评表及汇总统计表", size: "38 KB", format: "XLSX", count: 165 },
        { title: "党支部年度党建工作计划与总结编写提纲", size: "18 KB", format: "DOCX", count: 140 }
      ]
    },
    {
      category: "纪检监督与请假表单",
      icon: "shield",
      items: [
        { title: "中国古生物学会纪委信访举报信格式模板", size: "22 KB", format: "DOCX", count: 95 },
        { title: "党员因故缺席党支部组织生活/会议请假单", size: "15 KB", format: "DOCX", count: 180 },
        { title: "党风廉政建设个人自查自纠报告提纲", size: "20 KB", format: "DOCX", count: 85 }
      ]
    }
  ];

  return (
    <PartyLayout currentPageTitle="下载中心">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              标准化党务模板下载
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              归集标准化党务模板资源，包含入党申请书、思想汇报、转正申请、请假条等。
            </p>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">标准化 · 便捷下载</span>
        </div>

        {/* Download Categories */}
        <div className="flex flex-col gap-8">
          {templates.map((cat, cIdx) => (
            <div key={cIdx} className="bg-white border border-fossil-stone rounded p-5 shadow-sm">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 pb-3 border-b border-fossil-stone mb-4">
                <span className="material-symbols-outlined text-[22px] text-party-red block">{cat.icon}</span>
                {cat.category}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-paper-bright border border-fossil-stone hover:border-party-red p-4 rounded flex items-center justify-between gap-4 transition-colors group"
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <span className="material-symbols-outlined text-party-red mt-0.5">draft</span>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <h4 className="text-xs font-bold text-primary truncate group-hover:text-party-red cursor-pointer">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>大小：{item.size}</span>
                          <span>格式：{item.format}</span>
                          <span>下载：{item.count} 次</span>
                        </div>
                      </div>
                    </div>

                    <button className="text-[10px] font-bold text-primary hover:text-party-red border border-fossil-stone bg-white hover:bg-accent px-3 py-1.5 rounded transition-all shrink-0 flex items-center gap-0.5">
                      下载
                      <span className="material-symbols-outlined text-[12px]">download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PartyLayout>
  );
}
