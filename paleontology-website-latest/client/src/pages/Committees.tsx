import React from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Committees() {
  const committeeSections = [
    {
      title: "党委履职工作",
      icon: "shield_person",
      desc: "中共中国古生物学会委员会在中央和上级党组织领导下，切实履行政治核心与监督保证作用，保证政治方向、凝聚科研力量、推动学术创新、建设和谐学会。",
      points: [
        {
          subTitle: "政治引领与核心保障",
          content: "坚持把政治建设摆在首位，深入学习贯彻新时代中国特色社会主义思想，保证学会各项学术活动与重大决策符合党的路线方针政策。"
        },
        {
          subTitle: "重大事项前置把关",
          content: "对学会的重大决策、重要干部任免、重要项目安排和大额度资金使用（“三重一大”）等重大事项进行政治和方向上的前置审议把关。"
        },
        {
          subTitle: "思想政治与意识形态工作",
          content: "牢牢掌握意识形态工作领导权，指导学会期刊、网站、学术会议的舆论阵地建设，加强对广大古生物学科技工作者的思想政治引领。"
        }
      ]
    },
    {
      title: "纪委监督职责",
      icon: "gavel",
      desc: "学会纪律检查委员会是学会的党内监督专责机关，在学会党委和上级纪委领导下工作，维护党的章程和其他党内法规，协助党委推进全面从严治党。",
      points: [
        {
          subTitle: "政治纪律和规矩监督",
          content: "加强对学会各支部、各部门和党员领导干部遵守党章党规党纪情况的监督检查，坚决维护党中央权威和集中统一领导。"
        },
        {
          subTitle: "作风建设与纠治“四风”",
          content: "常态化开展中央八项规定精神执行情况的监督检查，坚决整治形式主义、官僚主义、享乐主义和奢靡之风，保持清正廉洁的学术作风。"
        },
        {
          subTitle: "畅通监督执纪渠道",
          content: "认真受理党员和群众的信访举报，依规依纪开展问题线索核查与执纪问责，切实发挥“探头”和“前哨”作用。"
        }
      ]
    },
    {
      title: "党风廉政建设统筹",
      icon: "balance",
      desc: "统筹推进学会党风廉政建设与反腐败工作，把清廉要求融入学术治理各环节，着力构建“清廉学会”与“阳光学术”。",
      points: [
        {
          subTitle: "廉政责任制落实",
          content: "明确党委主体责任、书记第一责任人责任、班子成员“一岗双责”和纪委监督责任，层层签订党风廉政建设责任书。"
        },
        {
          subTitle: "廉洁科研与学术诚信",
          content: "将廉政建设与科研诚信紧密结合，开展项目经费合规使用审计，防范科研项目申报、评审、实施中的利益冲突与学术不端行为。"
        },
        {
          subTitle: "经常性廉政警示教育",
          content: "每季度开展廉政专题警示教育，通报违纪违法典型案例，筑牢党员干部与广大科研人员拒腐防变的思想防线。"
        }
      ]
    }
  ];

  return (
    <PartyLayout currentPageTitle="党委纪委">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-party-red inline-block"></span>
            党委与纪委工作职责
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            展示学会党委政治引领作用、纪委监督职责及党风廉政建设的统筹落实情况。
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="party-gradient text-white p-6 rounded shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-accent-gold font-bold text-sm tracking-widest uppercase">Clean & Honest Academy</span>
            <h3 className="text-lg font-bold">筑牢政治堡垒，弘扬清风正气</h3>
            <p className="text-xs text-white/80 max-w-xl leading-relaxed mt-1">
              以政治建设为统领，全面加强党的纪律建设，将党风廉政建设贯穿于学会管理、学术交流、科学普及的全过程，保障学会健康有序发展。
            </p>
          </div>
          <div className="flex gap-4 text-xs font-semibold shrink-0">
            <span className="bg-white/10 px-4 py-2 rounded border border-white/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">verified</span>
              党委主体责任
            </span>
            <span className="bg-white/10 px-4 py-2 rounded border border-white/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">gavel</span>
              纪委监督责任
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-8 mt-4">
          {committeeSections.map((sec, index) => (
            <div key={index} className="bg-white border border-fossil-stone rounded p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 pb-3 border-b border-fossil-stone mb-4">
                <div className="bg-accent text-primary p-2 rounded">
                  <span className="material-symbols-outlined text-[24px] block text-party-red">{sec.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">{sec.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{sec.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sec.points.map((point, pIdx) => (
                  <div key={pIdx} className="bg-paper-bright border border-fossil-stone p-4 rounded flex flex-col gap-2 hover:border-accent-gold transition-colors">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-party-red rounded-full"></span>
                      {point.subTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {point.content}
                    </p>
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
