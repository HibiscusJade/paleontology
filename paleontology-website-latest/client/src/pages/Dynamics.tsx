import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Dynamics() {
  const dynamics = [
    {
      id: 1,
      title: "中国古生物学会党委组织党员科学家赴野外地质剖面开展‘把论文写在祖国大地上’主题实践活动",
      date: "2026-05-25",
      summary: "为深化党建与科研工作的融合，学会党委于5月中旬组织了由30余名中青年党员科学家组成的考察队，深入甘肃、青海等地的重要地层剖面，现场开展学术研讨与科普宣讲，充分发挥了党员先锋在科研一线的引领作用。",
      img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663722696584/gysodoNdzXEVcwP48r3Ven/scientists_spirit-BFESb9JGYv435kjYHbm66m.webp",
      branch: "第一党支部",
      clicks: 142
    },
    {
      id: 2,
      title: "学会第二党支部与南京大学地科院古生物学教师党支部联合开展‘支部共建促科研，联学联建谋发展’主题党日活动",
      date: "2026-05-18",
      summary: "双方支部党员围绕新时期学科建设、青年后备人才培养及国家自然科学基金申报经验等开展了深入座谈交流，签署了支部结对共建协议，探索了‘党建+学科’共建新模式。",
      img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663722696584/gysodoNdzXEVcwP48r3Ven/party_study-Bi9r2dyCmqwfkqpbE4Ej2p.webp",
      branch: "第二党支部",
      clicks: 98
    },
    {
      id: 3,
      title: "学会党群工作处举办2026年入党积极分子与预备党员专题培训班",
      date: "2026-05-08",
      summary: "本次培训为期三天，采取专题授课、观看警示教育片、撰写心得体会及结业考试相结合的方式，重点对党的性质、宗旨、纪律及二十大党章进行了深入解读，切实把好发展党员‘入口关’。",
      img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663722696584/gysodoNdzXEVcwP48r3Ven/party_banner-jBQJTUqe4SJ4mSGKcYzD7A.webp",
      branch: "党群工作处",
      clicks: 115
    }
  ];

  return (
    <PartyLayout currentPageTitle="工作动态">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              党建工作动态
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              常态化报道学会各党支部、各部门开展的党建活动、支部共建及交流实践动态。
            </p>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">图文报道 · 实时更新</span>
        </div>

        {/* Dynamics List (Image + Text Cards) */}
        <div className="flex flex-col gap-8">
          {dynamics.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-fossil-stone rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12 gap-6 group"
            >
              {/* Left Image Section */}
              <div className="md:col-span-4 h-48 md:h-full relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-party-red text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {item.branch}
                </div>
              </div>

              {/* Right Content Section */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-primary group-hover:text-party-red transition-colors leading-relaxed cursor-pointer line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-fossil-stone pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      阅读 {item.clicks} 次
                    </span>
                  </div>
                  <button className="text-xs font-semibold text-primary hover:text-party-red flex items-center gap-0.5 group-hover:underline">
                    阅读全文
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
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
