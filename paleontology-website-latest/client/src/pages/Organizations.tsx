import React, { useState } from "react";
import PartyLayout from "@/components/PartyLayout";

export default function Organizations() {
  const [activeTab, setActiveTab] = useState("all");

  const orgs = [
    {
      id: "office",
      name: "党群工作处",
      icon: "admin_panel_settings",
      desc: "学会党委日常办事机构，负责党建、组织、宣传、纪检、群团等工作的统筹协调与具体落实。",
      duties: [
        "起草学会党建工作规划、年度计划、总结报告等文件；",
        "组织开展党委中心组学习、“三会一课”、主题党日等组织生活；",
        "负责党员发展、教育、管理、服务和党费收缴工作；",
        "指导工会、共青团等群团组织依照章程独立自主开展工作；",
        "协助纪委开展党风廉政建设和反腐败工作。"
      ],
      members: [
        { role: "处长", name: "张华 教授", detail: "主持全面工作，分管组织与干部工作。" },
        { role: "副处长", name: "李明 副研究员", detail: "协助处长工作，分管宣传与思想政治工作。" },
        { role: "干事", name: "王芳", detail: "负责党员日常管理、党费收缴及群团联络。" }
      ]
    },
    {
      id: "committee",
      name: "党支部委员会",
      icon: "diversity_3",
      desc: "学会基层战斗堡垒，直接联系和服务党员群众，负责落实上级党组织及学会党委的决策部署。",
      duties: [
        "宣传和执行党的路线方针政策，贯彻落实上级党组织和本支部的决议；",
        "密切联系群众，做好群众的思想政治工作，维护群众的正当权益；",
        "对党员进行教育、管理、监督和服务，提高党员素质，增强党性；",
        "做好经常性的发展党员工作，注重在科研骨干和青年学术带头人中发展党员。"
      ],
      members: [
        { role: "支部书记", name: "刘杰 研究员", detail: "主持支部委员会全面工作。" },
        { role: "组织委员", name: "陈刚 博士", detail: "负责支部组织建设、党员发展及组织关系转接。" },
        { role: "宣传委员", name: "赵丽 副研究员", detail: "负责支部宣传报道、理论学习及思想政治工作。" }
      ]
    },
    {
      id: "union",
      name: "工会委员会",
      icon: "handshake",
      desc: "党领导下的教职工自愿结合的群众组织，是党联系群众的桥梁和纽带，负责维护会员合法权益、促进学会和谐发展。",
      duties: [
        "依法维护会员的民主权利、劳动权益和福利待遇；",
        "组织教职工参与学会民主管理，推进学会民主建设；",
        "开展丰富多彩的文体活动，丰富教职工业余文化生活；",
        "做好困难职工帮扶救助工作，开展“送温暖”活动。"
      ],
      members: [
        { role: "工会主席", name: "孙涛 教授", detail: "主持工会全面工作。" },
        { role: "经审委员", name: "周梅", detail: "负责工会经费审查与财务管理。" },
        { role: "女工委员", name: "吴静", detail: "负责女职工权益保护与特色活动开展。" }
      ]
    },
    {
      id: "youth",
      name: "共青团委员会",
      icon: "local_fire_department",
      desc: "先进青年的群团组织，是党的助手和后备军，负责引领凝聚青年、组织动员青年、联系服务青年。",
      duties: [
        "加强青年思想政治引领，组织青年学习党的创新理论；",
        "围绕学会中心工作，动员青年科技工作者在科研攻关中发挥生力军作用；",
        "关注青年成长诉求，服务青年在学术交流、职业发展、身心健康等方面的需要；",
        "加强团的自身建设，做好推荐优秀团员作为入党积极分子（“推优”）工作。"
      ],
      members: [
        { role: "团委书记", name: "郑亮 助理研究员", detail: "主持团委全面工作。" },
        { role: "团委副书记", name: "林菲 博士后", detail: "协助书记工作，分管青年学术沙龙与志愿服务。" }
      ]
    }
  ];

  const filteredOrgs = activeTab === "all" ? orgs : orgs.filter(o => o.id === activeTab);

  return (
    <PartyLayout currentPageTitle="党群机构">
      <div className="flex flex-col gap-6">
        <div className="border-b border-fossil-stone pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              学会党群组织体系
            </h2>
            <p className="text-xs text-muted-foreground mt-1">展示学会完整党群组织体系及各下设机构职能与架构。</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs bg-paper-bright p-1 border border-fossil-stone rounded">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === "all" ? "bg-primary text-white font-semibold" : "hover:bg-white text-primary"}`}
            >
              全部机构
            </button>
            {orgs.map(o => (
              <button
                key={o.id}
                onClick={() => setActiveTab(o.id)}
                className={`px-3 py-1.5 rounded transition-all ${activeTab === o.id ? "bg-primary text-white font-semibold" : "hover:bg-white text-primary"}`}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display */}
        <div className="flex flex-col gap-8">
          {filteredOrgs.map((org) => (
            <div key={org.id} className="bg-white border border-fossil-stone rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-strata-blue-deep to-[#004070] text-white p-6 flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <span className="material-symbols-outlined text-[36px] text-accent-gold block">{org.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide">{org.name}</h3>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed max-w-2xl">{org.desc}</p>
                </div>
              </div>

              {/* Main Info */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Duties */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                    <span className="material-symbols-outlined text-[18px] text-party-red">assignment</span>
                    主要职责与职能
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {org.duties.map((duty, index) => (
                      <li key={index} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="bg-accent text-primary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Members */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                    <span className="material-symbols-outlined text-[18px] text-party-red">groups</span>
                    组织架构与人员构成
                  </h4>
                  <div className="flex flex-col gap-3">
                    {org.members.map((member, index) => (
                      <div key={index} className="bg-paper-bright border border-fossil-stone p-3 rounded flex flex-col gap-1 hover:border-accent-gold transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary">{member.name}</span>
                          <span className="text-[10px] bg-accent text-primary font-bold px-2 py-0.5 rounded">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                          {member.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PartyLayout>
  );
}
