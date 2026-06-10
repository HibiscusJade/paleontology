import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function SpecialTopics() {
  const topics = [
    {
      id: 1,
      title: "党纪学习教育专题",
      timeRange: "2026年4月 - 2026年7月",
      desc: "贯彻落实党中央关于在全党开展党纪学习教育的决策部署，组织党员特别是党员领导干部认真学习《中国共产党纪律处分条例》，做到学纪、知纪、明纪、守纪。",
      img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663722696584/gysodoNdzXEVcwP48r3Ven/party_study-Bi9r2dyCmqwfkqpbE4Ej2p.webp",
      sections: [
        "《中国共产党纪律处分条例》专题学习与逐条解读",
        "党委书记讲纪律专题党课及研讨交流",
        "违纪违法典型案例警示教育及剖析反思"
      ],
      status: "进行中",
      statusColor: "bg-green-100 text-green-800 border-green-200"
    },
    {
      id: 2,
      title: "弘扬新时代科学家精神专项行动",
      timeRange: "2025年9月 - 2025年12月",
      desc: "深入贯彻关于弘扬科学家精神的重要指示，结合古生物学会百年发展史，深入挖掘老一辈古生物学家科技报国事迹，激励广大中青年学者潜心科研、勇攀高峰。",
      img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663722696584/gysodoNdzXEVcwP48r3Ven/scientists_spirit-BFESb9JGYv435kjYHbm66m.webp",
      sections: [
        "‘李四光精神与新时代古生物学者的使命’专题研讨会",
        "老一辈古生物学家历史手稿与科学精神微展览",
        "选树宣传新时代‘古生物学先锋党员科学家’先进事迹"
      ],
      status: "已归档",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200"
    }
  ];

  return (
    <PartyLayout currentPageTitle="党建专题">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-party-red inline-block"></span>
            主题党建专题
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            聚焦阶段性主题党建活动，集中展示专项党建工作成果、学习动态与实践成效。
          </p>
        </div>

        {/* Topics List */}
        <div className="flex flex-col gap-8">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white border border-fossil-stone rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6"
            >
              {/* Image Banner */}
              <div className="lg:col-span-4 h-48 lg:h-full min-h-[200px] relative overflow-hidden rounded border border-fossil-stone">
                <img
                  src={topic.img}
                  alt={topic.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold border shadow-sm ${topic.statusColor}`}>
                    {topic.status}
                  </span>
                </div>
              </div>

              {/* Topic Info */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>开展时间：{topic.timeRange}</span>
                  </div>
                  <h3 className="text-base font-bold text-primary hover:text-party-red cursor-pointer transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {topic.desc}
                  </p>
                </div>

                {/* Sub sections / milestones */}
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-party-red">bookmarks</span>
                    专题核心内容板块：
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {topic.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-party-red rounded-full"></span>
                        <span className="hover:text-party-red cursor-pointer transition-colors line-clamp-1">{sec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Action */}
                <div className="flex justify-end border-t border-fossil-stone pt-3">
                  <button className="text-xs font-semibold text-primary hover:text-party-red flex items-center gap-0.5 border border-fossil-stone hover:border-party-red px-4 py-2 rounded transition-all bg-paper-bright">
                    进入专题学习空间
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PartyLayout>
  );
}
