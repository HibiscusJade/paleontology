import React, { useState } from "react";
import PartyLayout from "@/components/PartyLayout";

export default function TeamBuilding() {
  const [activeSub, setActiveSub] = useState("6.1");

  const subMenus = [
    { id: "6.1", title: "队伍概况" },
    { id: "6.2", title: "发展党员" },
    { id: "6.3", title: "党员教育" },
    { id: "6.4", title: "党员管理" },
    { id: "6.5", title: "党员服务" },
    { id: "6.6", title: "党员奖惩" },
    { id: "6.7", title: "党费管理" }
  ];

  return (
    <PartyLayout currentPageTitle="党员队伍建设">
      <div className="flex flex-col gap-6">
        {/* Header & Sub-Navigation */}
        <div className="border-b border-fossil-stone pb-4 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-party-red inline-block"></span>
              党员队伍建设全貌
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              规范展示学会党员队伍概况、党员发展流程、教育培训、日常管理及服务。
            </p>
          </div>
          {/* Horizonal Sub-tabs */}
          <div className="flex flex-wrap gap-1 bg-paper-bright p-1 border border-fossil-stone rounded text-xs">
            {subMenus.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSub(sub.id)}
                className={`px-3 py-2 rounded transition-all font-semibold ${activeSub === sub.id ? "bg-primary text-white" : "hover:bg-white text-primary"}`}
              >
                {sub.id} {sub.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Render based on sub-tab */}
        <div className="bg-white rounded">
          {/* 6.1 党员队伍概况 */}
          {activeSub === "6.1" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">analytics</span>
                党员队伍基本概况
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                中国古生物学会现有正式党员320名，预备党员15名，分布在全国各高等院校、科研院所、博物馆及科普基地。
                党员队伍中，具有高级职称的科研骨干占比达68%，拥有博士学位的党员占比达72%，呈现出高学历、高学术水平、中青年为主的特点。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded text-center">
                  <span className="text-2xl font-bold text-party-red">335 名</span>
                  <p className="text-xs text-muted-foreground mt-1">党员总数（含预备党员）</p>
                </div>
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded text-center">
                  <span className="text-2xl font-bold text-primary">68 %</span>
                  <p className="text-xs text-muted-foreground mt-1">高级职称党员占比</p>
                </div>
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded text-center">
                  <span className="text-2xl font-bold text-accent-gold">72 %</span>
                  <p className="text-xs text-muted-foreground mt-1">博士学历党员占比</p>
                </div>
              </div>
            </div>
          )}

          {/* 6.2 发展党员 */}
          {activeSub === "6.2" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">how_to_reg</span>
                发展党员工作细则与公示
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                学会严格按照“控制总量、优化结构、提高质量、发挥作用”的方针，规范发展党员程序，重点在优秀青年科研骨干中发展党员。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="border border-fossil-stone p-4 rounded bg-paper-bright flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-primary">入党及转正材料模板</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="bg-white border border-fossil-stone/60 p-2.5 rounded flex justify-between items-center">
                      <span>1. 入党申请书撰写规范及范文</span>
                      <span className="text-party-red font-bold text-[10px] cursor-pointer hover:underline">下载</span>
                    </div>
                    <div className="bg-white border border-fossil-stone/60 p-2.5 rounded flex justify-between items-center">
                      <span>2. 预备党员转正申请书模板</span>
                      <span className="text-party-red font-bold text-[10px] cursor-pointer hover:underline">下载</span>
                    </div>
                  </div>
                </div>
                <div className="border border-fossil-stone p-4 rounded bg-paper-bright flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-primary">发展与转正公示</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="bg-white border border-fossil-stone/60 p-2.5 rounded flex justify-between items-center">
                      <span className="truncate">关于接收王林等2名同志为预备党员的公示</span>
                      <span className="text-muted-foreground text-[10px]">2026-05-18</span>
                    </div>
                    <div className="bg-white border border-fossil-stone/60 p-2.5 rounded flex justify-between items-center">
                      <span className="truncate">关于李明同志预备党员转正审核结果公示</span>
                      <span className="text-muted-foreground text-[10px]">2026-05-02</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.3 党员教育 */}
          {activeSub === "6.3" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">school</span>
                党员教育培训与实践
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                坚持理论教育与实践研学相结合，常态化开展红色基地研学、廉政教育及团队主题教育活动。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded flex gap-4">
                  <span className="material-symbols-outlined text-[36px] text-party-red">map</span>
                  <div>
                    <h4 className="text-xs font-bold text-primary">红色基地研学</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      组织党员赴延安、井冈山等革命圣地及地质学家报国教育基地开展现场教学，感悟先辈初心。
                    </p>
                  </div>
                </div>
                <div className="bg-paper-bright border border-fossil-stone p-4 rounded flex gap-4">
                  <span className="material-symbols-outlined text-[36px] text-party-red">gavel</span>
                  <div>
                    <h4 className="text-xs font-bold text-primary">党风廉政警示教育</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      定期开展科研经费合规使用、学术诚信专题廉洁教育，筑牢科研党员纪律红线。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.4 党员管理 */}
          {activeSub === "6.4" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">manage_accounts</span>
                党员日常规范管理
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                规范党员组织关系转接，严格执行民主评议党员制度，健全党员日常管理台账。
              </p>
              <div className="border border-fossil-stone rounded overflow-hidden mt-2 text-xs">
                <div className="bg-paper-bright p-3 font-bold border-b border-fossil-stone flex justify-between">
                  <span>管理事项</span>
                  <span>核心流程 / 原则</span>
                </div>
                <div className="p-3 border-b border-fossil-stone flex justify-between items-center">
                  <span className="font-semibold">组织关系转接</span>
                  <span className="text-muted-foreground">通过全国党员信息系统线上转接，外省转入需开具纸质介绍信。</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold">民主评议党员</span>
                  <span className="text-muted-foreground">每年底结合组织生活会开展，按照‘优秀、合格、基本合格、不合格’进行评定。</span>
                </div>
              </div>
            </div>
          )}

          {/* 6.5 党员服务 */}
          {activeSub === "6.5" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">volunteer_activism</span>
                困难党员帮扶与暖心服务
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                学会党委建立健全党内激励、关怀、帮扶机制，主动走访慰问老党员、生活困难党员，切实解决党员群众急难愁盼问题。
              </p>
              <div className="bg-paper-bright border border-fossil-stone p-4 rounded flex flex-col gap-3 mt-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-party-red shrink-0">favorite</span>
                  <div>
                    <span className="font-bold text-primary">“七一”及元旦春节走访慰问</span>
                    <p className="text-muted-foreground mt-1 leading-relaxed">每年对70岁以上老党员、患病或生活困难党员进行上门走访慰问，发放慰问金和慰问品。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.6 党员奖惩 */}
          {activeSub === "6.6" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">military_tech</span>
                党员先锋表彰与纪律约束
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                对在科研攻关、科普服务、学会建设中做出突出贡献的党员进行表彰，对违纪违规党员依规严肃处理。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs">
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <h4 className="font-bold text-green-900 flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                    先锋表彰（激励机制）
                  </h4>
                  <p className="text-green-800 leading-relaxed">
                    每两年评选表彰一次‘优秀共产党员’、‘优秀党务工作者’和‘先进基层党组织’。
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 className="font-bold text-red-900 flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    纪律约束（惩戒机制）
                  </h4>
                  <p className="text-red-800 leading-relaxed">
                    严格执行党纪处分条例，对触犯科研诚信红线、违反党纪国法的党员坚决零容忍、依规查处。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6.7 党费管理 */}
          {activeSub === "6.7" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-fossil-stone">
                <span className="material-symbols-outlined text-[20px] text-party-red">payments</span>
                党费收缴使用与管理规定
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                严格执行中组部党费收缴管理规定，按月足额收缴，定期公示台账，确保党费使用公开透明、合规高效。
              </p>
              <div className="border border-fossil-stone rounded overflow-hidden mt-2 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-bright border-b border-fossil-stone font-bold">
                      <th className="p-3">收缴基数比例</th>
                      <th className="p-3">使用范围</th>
                      <th className="p-3">年度公示情况</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-fossil-stone">
                      <td className="p-3 leading-relaxed">税后月收入3000元以下交纳0.5%；3000-5000元交纳1%；5000-10000元交纳1.5%；10000元以上交纳2%。</td>
                      <td className="p-3 leading-relaxed">党员教育培训、订阅党报党刊、购买党建图书、走访慰问困难党员等。</td>
                      <td className="p-3 leading-relaxed text-green-700 font-semibold">2025年度党费收缴使用情况已于今年1月在全会公示通过。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PartyLayout>
  );
}
