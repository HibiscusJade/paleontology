import React from "react";
import { Link } from "wouter";
import PartyLayout from "../components/PartyLayout";

export default function Home() {
  const sections = [
    {
      id: "announcements",
      title: "通知公告",
      icon: "campaign",
      desc: "发布上级党组织重要批示指示、巡视巡察公告、党内选举公告、党务正式通知、各类公示文件。",
      path: "/announcements",
      color: "border-party-red"
    },
    {
      id: "organizations",
      title: "党群机构",
      icon: "account_tree",
      desc: "展示学会完整党群组织体系，下设党群工作处、党支部委员会、工会、共共青团委员会详情。",
      path: "/organizations",
      color: "border-primary"
    },
    {
      id: "committees",
      title: "党委纪委",
      icon: "verified_user",
      desc: "专项展示党委履职工作、纪委监督职责、党风廉政建设统筹工作等，推进廉洁学会建设。",
      path: "/committees",
      color: "border-accent-gold"
    },
    {
      id: "work",
      title: "党建工作",
      icon: "work",
      desc: "集中展示年度党建工作要点、阶段性党建任务、工作部署、专项整治、党建责任制落实情况。",
      path: "/work",
      color: "border-party-red"
    },
    {
      id: "activities",
      title: "组织生活",
      icon: "groups",
      desc: "包含换届选举规范、三会一课、主题党日、民主生活会等常态化组织生活纪实与会议记录。",
      path: "/activities",
      color: "border-primary"
    },
    {
      id: "team-building",
      title: "党员队伍建设",
      icon: "person_add",
      desc: "规范展示党员队伍概况、发展党员、党员教育、党员管理、党员服务、党员奖惩、党费管理。",
      path: "/team-building",
      color: "border-accent-gold"
    },
    {
      id: "theory-study",
      title: "理论学习专栏",
      icon: "menu_book",
      desc: "对接权威学习数据库、党内重要法规、基础党务知识，打造线上党员理论学习高地。",
      path: "/theory-study",
      color: "border-party-red"
    },
    {
      id: "dynamics",
      title: "工作动态",
      icon: "vital_signs",
      desc: "常态化更新学会各类党建活动、支部工作、党建交流、基层实践等图文新闻动态。",
      path: "/dynamics",
      color: "border-primary"
    },
    {
      id: "special-topics",
      title: "党建专题",
      icon: "topic",
      desc: "阶段性主题党建专题（如党纪学习教育、专项行动等）成果汇聚与成效集中展示。",
      path: "/special-topics",
      color: "border-accent-gold"
    },
    {
      id: "exemplars",
      title: "先进典型",
      icon: "military_tech",
      desc: "弘扬杰出科学家精神、展示优秀党员科学家事迹、老党员先锋风采及国家级、省部级党建荣誉。",
      path: "/exemplars",
      color: "border-party-red"
    },
    {
      id: "reporting",
      title: "违法违纪举报",
      icon: "shield",
      desc: "公示举报渠道、举报须知、监督规范，畅通党内监督、群众监督渠道，落实党风廉政建设。",
      path: "/reporting",
      color: "border-primary"
    },
    {
      id: "downloads",
      title: "下载中心",
      icon: "download",
      desc: "归集标准化党务模板资源，包含入党申请书、思想汇报、转正申请等常规党务资料。",
      path: "/downloads",
      color: "border-accent-gold"
    }
  ];

  return (
    <PartyLayout currentPageTitle="党建文化中心">
      {/* Slogan Banner */}
      <div className="bg-white border border-fossil-stone rounded shadow-sm p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="party-gradient text-white p-3 rounded">
            <span className="material-symbols-outlined text-[36px] fill-1">military_tech</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">新时代党建引领学术腾飞</h2>
            <p className="text-xs text-muted-foreground mt-1">
              贯彻落实新时代党的建设总要求，发挥基层党组织战斗堡垒作用和党员先锋模范作用。
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/theory-study">
            <span className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 transition-colors cursor-pointer">
              理论学习
            </span>
          </Link>
          <Link href="/announcements">
            <span className="px-4 py-2 border border-primary text-primary text-xs font-semibold rounded hover:bg-paper-bright transition-colors cursor-pointer">
              通知公告
            </span>
          </Link>
        </div>
      </div>

      {/* 12 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className={`bg-white border border-fossil-stone rounded shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group border-t-4 ${sec.color}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-[32px] text-party-red group-hover:scale-110 transition-transform">
                  {sec.icon}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-paper-bright px-2 py-0.5 border border-fossil-stone rounded">
                  {sec.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-primary mb-2 group-hover:text-party-red transition-colors">
                {sec.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {sec.desc}
              </p>
            </div>
            <div className="bg-paper-bright px-6 py-3 border-t border-fossil-stone flex justify-end">
              <Link href={sec.path}>
                <span className="text-xs font-semibold text-primary hover:text-party-red transition-colors flex items-center gap-1 cursor-pointer">
                  进入栏目
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PartyLayout>
  );
}
