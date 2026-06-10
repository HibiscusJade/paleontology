import React, { useState, useEffect } from "react";
import PartyLayout from "../components/PartyLayout";
import { Link, useLocation } from "wouter";
import { useMembership } from "../contexts/MembershipContext";
import { toast } from "sonner";
import LoginJoinDialog from "../components/LoginJoinDialog";
import { CONFERENCE_STATUS_LABEL, CONFERENCE_STATUS_COLOR } from "@shared/constants";

export default function Services() {
  const [location, setLocation] = useLocation();
  const {
    currentUser,
    isLoggedIn,
    societyMembership,
    boundBranches,
    conferenceRegs,
    applySocietyMembership,
    submitMembershipVoucher,
    submitMembershipInvoice,
    toggleBranchBinding,
    payConference,
    submitConferenceVoucher,
    submitConferenceInvoice,
    submitConferenceForm,
    deleteAbstract,
    uploadAbstract,
    simApproveSocietyMembership,
    simRejectSocietyMembership,
    simApproveSocietyVoucher,
    simRejectSocietyVoucher,
    simApproveSocietyInvoice,
    simRejectSocietyInvoice,
    simApproveConference,
    simRejectConference,
    simApproveConferenceVoucher,
    simRejectConferenceVoucher,
    simApproveConferenceInvoice,
    simRejectConferenceInvoice,
    getMembershipFee,
  } = useMembership();

  // Parse URL query parameter for tab selection (e.g. /services?tab=member)
  const [activeTab, setActiveTab] = useState<"branches" | "member" | "conference" | "international" | "science" | "awards" | "main">("main");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["branches", "member", "conference", "international", "science", "awards", "main"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [location]);

  // Dialog & Flow States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogOpenTab] = useState<"login" | "register">("login");
  const [showFeePayment, setShowFeePayment] = useState<string | null>(null); // branch ID
  const [paymentStep, setPaymentStep] = useState<number>(1);
  
  // Voucher upload local files mocks
  const [voucherFile, setVoucherFile] = useState<string | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<string | null>(null);

  // Conference details flow states
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [confPaymentTarget, setConfPaymentTarget] = useState<string | null>(null);
  const [confPaymentStep, setConfPaymentStep] = useState<number>(1);
  const [confVoucher, setConfVoucher] = useState<string | null>(null);
  const [confInvoice, setConfInvoice] = useState<string | null>(null);
  const [editingReg, setEditingReg] = useState<string | null>(null);

  // Form state for conference registration
  const [regForm, setRegForm] = useState<any>({
    name: "",
    gender: "男",
    unit: "",
    role: "教师",
    accommodation: "自行安排",
    session: "古脊椎动物演化与环境专场",
    presentationType: "仅参会",
    reportTitle: "",
    abstractFileName: ""
  });

  // Simulator state
  const [simConfId, setSimConfId] = useState("conf-1");
  const [simRejectReason, setSimRejectReason] = useState("上传的銀行汇款回单模糊，无法辨认汇款人和金额，请重新拍摄。");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  // Member fee payment flow
  const [memberPayStep, setMemberPayStep] = useState(1);
  const [memberVoucher, setMemberVoucher] = useState<string | null>(null);
  const [memberInvoice, setMemberInvoice] = useState<string | null>(null);

  // Conference branch filter (set when clicking "查看该分会会议" from member tab)
  const [conferenceBranchFilter, setConferenceBranchFilter] = useState<string | null>(null);

  // Sync profile data when editing conference form
  useEffect(() => {
    if (currentUser) {
      setRegForm((prev: any) => ({
        ...prev,
        name: prev.name || currentUser.name,
        gender: prev.gender || currentUser.gender,
        unit: prev.unit || currentUser.unit,
        role: prev.role || currentUser.role
      }));
    }
  }, [currentUser, editingReg]);

  // Academic branches
  const branches = [
    { id: "gwjzdwxfh", name: "古无脊椎动物学分会", desc: "中国古生物学会古无脊椎动物学分会是中国古生物学会下的一个二级组织，2016年12月18日在贵州贵阳成立，致力于联合国内各单位相关专家，组织学术交流，强化科学普及活动。" },
    { id: "kpgzwyh", name: "科普工作委员会", desc: "团结全国广大地质古生物科普工作者，开展卓有成效的科普工作，扩大中国古生物学会在社会上的影响，提高全民科学素质。" },
    { id: "bfxfh", name: "孢粉学分会", desc: "从事孢粉学理论研究及其在生物地层、古生态、第四纪古环境中的应用，1979年于天津正式成立，中国是国际孢粉学会联合会的发起国之一。" },
    { id: "wtxfh", name: "微体学分会", desc: "1979年3月在长沙成立，在推动我国微体古生物学学术交流及学科发展、服务我国矿产能源勘探开发等方面做出了重要贡献。" },
    { id: "hszlzwyh", name: "化石藻类专业委员会", desc: "成立于1981年12月，是我国化石藻类专业科学技术工作组跨行业、跨部门自愿结合依法登记成立的公益性非营利社会学术团体。" },
    { id: "gzwxfh", name: "古植物学分会", desc: "1983年于西安成立，在古植物系统演化、古气候与古环境变化、碳循环等领域做出卓越贡献，在早期陆生植物演化等领域跻身世界前列。" },
    { id: "dqswx", name: "地球生物学分会", desc: "2018年9月18日在南京成立，旨在团结地球生物学科技工作者，推动国内地球生物学的发展与提升学科领域整体研究水平。" },
    { id: "gst", name: "古生态专业分会", desc: "1988年10月成立，旨在团结、组织全国古生态学工作者，研究化石记录中的生物与其当时生活物理、化学环境之间的相互制约关系。" },
    { id: "gjzdw", name: "古脊椎动物学分会", desc: "1984年10月17日在山东莱阳成立，团结全国古脊椎动物学工作者积极开展学术交流，提高古脊椎动物学研究的科学水平。" },
    { id: "swcj", name: "生物沉积学分会", desc: "2024年10月26日在中国地质大学（武汉）成立，旨在揭示生物参与发生在地球上各种沉积过程和化学循环的机制。" },
    { id: "xjsxff", name: "新技术新方法专业委员会", desc: "2024年12月7日成立，旨在搭建古生物新技术新方法的交流合作平台，推动古生物学研究与新技术、新方法的深度融合。" },
  ];

  // Conferences
  const conferences = [
    {
      id: "demo-conf",
      branchId: "gwjzdwxfh",
      title: "【演示会议】古无脊椎动物学学术工作坊",
      branchName: "古无脊椎动物学分会",
      time: "2026年06月15日",
      location: "线上 · 腾讯会议",
      fee: 300,
      status: "演示",
      feeDeadline: "2026-12-31",
      abstractDeadline: "2026-12-31",
      desc: "这是一个演示会议，用于展示参会信息填写流程。会议费已审核通过，您可以直接点击'填写参会与报告信息'按钮体验完整的参会流程，包括选择报告类型、上传摘要、选择住宿等功能。"
    },
    {
      id: "conf-1",
      branchId: "wtxfh",
      title: "第十五届全国微体古生物学学术研讨会",
      branchName: "微体学分会",
      time: "2026年11月15日 - 11月18日",
      location: "江苏 · 南京",
      fee: 1200,
      status: "正在报名",
      feeDeadline: "2026-10-31",
      abstractDeadline: "2026-10-15",
      desc: "本次大会由中国古生物学会微体学分会主办，围绕'微体古生物与能源勘探、环境演变及精细生物地层学'开展广泛学术交流，热忱欢迎广大古生物学、地层学及石油地质领域的科研人员、高校师生及行业代表参会。"
    },
    {
      id: "conf-2",
      branchId: "gzwxfh",
      title: "2026年度古植物学与环境演变论坛",
      branchName: "古植物学分会",
      time: "2026年12月05日",
      location: "北京 · 中国科学院",
      fee: 800,
      status: "即将开启",
      feeDeadline: "2026-11-15",
      abstractDeadline: "2026-11-01",
      desc: "探讨陆地植物的多样性起源、古生代至新生代植被演替以及重大气候事件对陆地生态系统的重塑。会议将邀请多位国际知名学者作大会特邀报告。"
    },
    {
      id: "conf-3",
      branchId: "gjzdw",
      title: "热河生物群国际学术研讨会",
      branchName: "古脊椎动物学分会",
      time: "2027年03月20日",
      location: "辽宁 · 朝阳",
      fee: 1500,
      status: "预告通知",
      feeDeadline: "2027-02-28",
      abstractDeadline: "2027-02-10",
      desc: "纪念热河生物群发现百周年国际盛会，聚焦中生代陆相生态系统的辐射演化，包括羽毛恐龙、早期鸟类及被子植物的起源等世界级科学难题。"
    },
    {
      id: "conf-4",
      branchId: "gjzdw",
      title: "第十二届全国古脊椎动物学学术年会",
      branchName: "古脊椎动物学分会",
      time: "2026年09月18日 - 09月21日",
      location: "云南 · 昆明",
      fee: 1000,
      status: "正在报名",
      feeDeadline: "2026-08-31",
      abstractDeadline: "2026-08-15",
      desc: "全国古脊椎动物学领域最重要的年度学术盛会，聚焦脊椎动物起源与演化、恐龙与鸟类关系、哺乳动物辐射演化等核心议题，欢迎国内外相关领域学者踊跃参会。"
    },
    {
      id: "conf-5",
      branchId: "bfxfh",
      title: "中国孢粉学会第十届全国学术大会",
      branchName: "孢粉学分会",
      time: "2026年10月22日 - 10月25日",
      location: "广东 · 广州",
      fee: 900,
      status: "正在报名",
      feeDeadline: "2026-09-30",
      abstractDeadline: "2026-09-15",
      desc: "汇聚全国孢粉学研究力量，围绕孢粉化石与古气候重建、第四纪环境演变、生物地层精细划分等热点议题开展深入交流，并设有孢粉鉴定技术培训专场。"
    },
    {
      id: "conf-6",
      branchId: "gst",
      title: "古生态学与古环境重建国际研讨会",
      branchName: "古生态专业分会",
      time: "2026年08月10日 - 08月13日",
      location: "四川 · 成都",
      fee: 1100,
      status: "正在报名",
      feeDeadline: "2026-07-20",
      abstractDeadline: "2026-07-05",
      desc: "聚焦化石记录中生物与古环境的相互关系，探讨古生态系统对重大地质事件的响应机制，涵盖群落古生态、功能形态学及古食物网重建等前沿方向。"
    },
    {
      id: "conf-7",
      branchId: "dqswx",
      title: "地球生物学前沿论坛",
      branchName: "地球生物学分会",
      time: "2026年07月05日 - 07月07日",
      location: "湖北 · 武汉",
      fee: 600,
      status: "即将开启",
      feeDeadline: "2026-06-20",
      abstractDeadline: "2026-06-10",
      desc: "聚焦生物与地球系统的协同演化，探讨生物成矿、碳循环与生命起源等重大科学问题，是地球生物学分会成立以来规模最大的年度学术活动。"
    },
    {
      id: "conf-8",
      branchId: "xjsxff",
      title: "古生物学新技术新方法专题研讨会",
      branchName: "新技术新方法专业委员会",
      time: "2026年11月28日 - 11月30日",
      location: "湖北 · 武汉（中国地质大学）",
      fee: 500,
      status: "即将开启",
      feeDeadline: "2026-11-10",
      abstractDeadline: "2026-11-01",
      desc: "专注于CT扫描、三维重建、同步辐射、人工智能识别等新技术在古生物学研究中的最新应用，设有技术演示与实操培训环节，欢迎对新技术感兴趣的研究人员参加。"
    }
  ];

  const mockVoucherUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCYIKxophjI9VUuetJuvkK5GcwQg2Yx4mJ6ad4thQyAGyXg_aJDk8e6Pqsg_WjOL9LtO7UbUlGghcpyhwbvGagEsopXe-xqv4bzd2K9b4nmSyIIjSnUGX0E7hCfWWyovFuLLGrcmbFHTdTvRvOWx_9rVuc9AJcscqZNQq5wj1Jfg6V4QDrOrL-Rdx8NywF5ELn7lY4rzQHwhGRxrq3gBIUZscn5alwj4Ep09ZvZY_jZP8MSsqxALmnA_YG9MZikpA497cfcoKNoS38";

  // ==========================================================================
  // RENDER: MAIN PORTAL (code3)
  // ==========================================================================
  const renderMainPortal = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-white border-b border-[#E5E1DA] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="font-bold text-xs tracking-widest text-[#715a3e] block mb-4 uppercase">SOCIETY SERVICE PORTAL</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#002B49] mb-6 leading-tight font-serif" style={{ fontFamily: "Georgia, serif" }}>
              为古生物学研究<br />注入科学与数字力量
            </h1>
            <p className="text-base text-slate-600 mb-8 leading-relaxed">
              中国古生物学会学术服务门户，为您提供便捷的在线会员申请、学术会议报名、国际交流项目合作、科普教育传播及国家科技奖励申报一站式数字化服务。
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setActiveTab("branches")} className="bg-[#002B49] hover:bg-[#001f35] text-white px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">account_tree</span> 专业分会
              </button>
              <button onClick={() => setActiveTab("international")} className="border border-[#002B49] text-[#002B49] hover:bg-slate-50 px-8 py-3 rounded-lg font-bold text-sm transition-all">
                国际交流
              </button>
            </div>
          </div>
          <div className="hidden md:block w-1/3 aspect-square relative">
            <div className="absolute inset-0 bg-[#f5e0ba] opacity-20 rounded-full blur-3xl"></div>
            <img alt="Fossil" className="w-full h-full object-contain mix-blend-multiply filter contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYIKxophjI9VUuetJuvkK5GcwQg2Yx4mJ6ad4thQyAGyXg_aJDk8e6Pqsg_WjOL9LtO7UbUlGghcpyhwbvGagEsopXe-xqv4bzd2K9b4nmSyIIjSnUGX0E7hCfWWyovFuLLGrcmbFHTdTvRvOWx_9rVuc9AJcscqZNQq5wj1Jfg6V4QDrOrL-Rdx8NywF5ELn7lY4rzQHwhGRxrq3gBIUZscn5alwj4Ep09ZvZY_jZP8MSsqxALmnA_YG9MZikpA497cfcoKNoS38" />
          </div>
        </div>

        {/* Quick Services Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div onClick={() => setActiveTab("branches")} className="bg-white border-t-4 border-[#002B49] border-x border-b border-[#E5E1DA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group rounded-b-lg">
              <div className="bg-slate-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 group-hover:bg-[#002B49] transition-colors">
                <span className="material-symbols-outlined text-[#002B49] group-hover:text-white">account_tree</span>
              </div>
              <h3 className="font-bold text-lg text-[#002B49] mb-2">专业分会 (重点)</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">下耆11个专业分会（委员会），覆盖古生物学各主要研究领域，点击了解各分会详情。</p>
              <span className="flex items-center text-[#715a3e] font-bold text-xs tracking-widest">了解分会 <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span></span>
            </div>
            <div onClick={() => setActiveTab("international")} className="bg-white border-t-4 border-[#002B49] border-x border-b border-[#E5E1DA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group rounded-b-lg">
              <div className="bg-slate-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 group-hover:bg-[#002B49] transition-colors">
                <span className="material-symbols-outlined text-[#002B49] group-hover:text-white">public</span>
              </div>
              <h3 className="font-bold text-lg text-[#002B49] mb-2">国际交流</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">外事手续指导、国际会议组织申报及国际合作机构联络。</p>
              <span className="flex items-center text-[#715a3e] font-bold text-xs tracking-widest">了解更多 <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span></span>
            </div>
            <div onClick={() => setActiveTab("science")} className="bg-white border-t-4 border-[#002B49] border-x border-b border-[#E5E1DA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group rounded-b-lg">
              <div className="bg-slate-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 group-hover:bg-[#002B49] transition-colors">
                <span className="material-symbols-outlined text-[#002B49] group-hover:text-white">biotech</span>
              </div>
              <h3 className="font-bold text-lg text-[#002B49] mb-2">科学传播</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">科普工作动态、期刊服务、科普基地申请及化石保护利用。</p>
              <span className="flex items-center text-[#715a3e] font-bold text-xs tracking-widest">探索资源 <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-12 bg-white border-y border-[#E5E1DA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#002B49] font-serif">核心学术服务</h2>
              <p className="text-slate-500 text-xs mt-2">为您提供全生命周期的学术生涯支持</p>
            </div>
            <button className="text-xs font-bold text-[#002B49] flex items-center gap-1 hover:text-[#715a3e] transition-colors">
              全部服务项 <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-[#E5E1DA] p-8 rounded-lg flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("awards")}>
              <div className="text-[#715a3e]"><span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rewarded_ads</span></div>
              <h4 className="text-lg font-bold text-[#002B49]">科技奖励申报</h4>
              <p className="text-slate-600 text-xs leading-relaxed">中国古生物学会设立了多个行业权威奖项（如杰出成就奖、青年古生物学奖等），在线填报申报材料并进行同行专家推荐评审。</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 科技奖励申报指南</li>
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 历届获奖人及成果名录</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-[#E5E1DA] p-8 rounded-lg flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("science")}>
              <div className="text-[#715a3e]"><span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span></div>
              <h4 className="text-lg font-bold text-[#002B49]">期刊出版服务</h4>
              <p className="text-slate-600 text-xs leading-relaxed">提供学会主办的《古生物学报》、《Palaeoworld》等权威中英文期刊的在线投稿系统链接、征稿简则、审稿流程及最新出版刊期目录查询。</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 学术期刊在线投稿通道</li>
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 中英文征稿简则及排版模板</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-[#E5E1DA] p-8 rounded-lg flex flex-col gap-4">
              <div className="text-[#715a3e]"><span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span></div>
              <h4 className="text-lg font-bold text-[#002B49]">科普基地与化石保护</h4>
              <p className="text-slate-600 text-xs leading-relaxed">指导全国各级古生物科普基地的申报与复核，发布国家重点保护化石名录及化石发掘、出境、保护政策条例，提供化石修复技术培训咨询。</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 全国科普基地申报入口</li>
                <li className="flex items-center text-xs text-slate-600 gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> 化石发掘与保护条例指南</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* News & Notifications Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Latest News */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#002B49] flex items-center gap-3 font-serif">
                最新学术动态 <span className="bg-[#715a3e] h-[2px] w-12 rounded-full"></span>
              </h2>
              <button className="text-xs font-bold text-[#715a3e] hover:underline">浏览全部</button>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 group cursor-pointer">
                <div className="flex-shrink-0 w-32 h-20 bg-slate-100 overflow-hidden rounded-lg border border-[#E5E1DA]">
                  <img alt="News" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwBlYTJn5H-3flv59YIjLgJvKRVGDGSKdV2RBMtHlU_VE_8YLzBZtY7husS1CyRbGwgD8P-61mYr8qm0_etQEb70qOzzZqEGIrExcAlO76g5NQZhpB0mNrx4SpzYld71GxSVHWlfND4vzyXkUZY4DsQKoo1MsMkw4IEzQt8qgtjGlL2-vZpeq0Fc3n89-jMlX3MBzFb3ShAMzOY3AJ8BMabc1_6H3LzePpbkMEiJt3Aol0iBy1g-SqTX74AvnM4m7TZTPIB6DVsRw" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#715a3e]">2026.05.28</span>
                  <h4 className="text-sm font-bold text-[#002B49] group-hover:text-[#715a3e] transition-colors mb-1">中国古生物学会微体古生物学分会理事会顺利召开</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">理事会确定了第十五届全国学术研讨会的具体日程及特邀专家人选，并对分会会费收缴工作进行了统一部署...</p>
                </div>
              </div>
              <div className="flex gap-4 group cursor-pointer">
                <div className="flex-shrink-0 w-32 h-20 bg-slate-100 overflow-hidden rounded-lg border border-[#E5E1DA]">
                  <img alt="News" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWsU2kYBHrnG-GqB9moVKqDOO7ltmqvZqCJeCWgkojEoYZ223lqsbCHoNVNwvZLTLn_Aj2asB4rl7DayvXNv4nzC6d63sK7FLJxHBEgSiRgn2tcCkPXQ5fl4_1Y9YtY7F8Le4UR2_ofxW2Lj8rqAXagLDzRsyb_ZKU6NB6LVEIHRViw215TIkNUlvO7nxwZjXXBxTNirTKhYiIRrN5dg3WCz11aJpNguI8WAh5zSQ_NaF93_Y76ftO4D_yILrJ3o93eESSQ-Rgpl8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#715a3e]">2026.05.15</span>
                  <h4 className="text-sm font-bold text-[#002B49] group-hover:text-[#715a3e] transition-colors mb-1">孢粉学分会在澄江科普基地开展“探索生命演化”研学活动</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">活动吸引了来自全国50余名中学生参与，通过显微镜观察化石孢粉，激发了青少年对地球生命科学的浓厚兴趣...</p>
                </div>
              </div>
            </div>
          </div>
          {/* Notifications */}
          <div className="bg-slate-50 p-8 rounded-xl border border-[#E5E1DA]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#002B49] flex items-center gap-3 font-serif">
                最新通知公告 <span className="bg-[#002B49] h-[2px] w-12 rounded-full"></span>
              </h2>
              <Link href="/society-announcements">
                <span className="text-xs font-bold text-[#002B49] hover:underline cursor-pointer">查看列表</span>
              </Link>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 bg-white border-l-4 border-[#715a3e] rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("branches")}>
                <div className="flex flex-col items-center justify-center bg-slate-100 w-12 h-12 rounded-lg flex-shrink-0">
                  <span className="font-bold text-[#002B49] text-sm">01</span>
                  <span className="text-[9px] text-slate-500 font-bold">JUN</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#002B49] hover:text-[#715a3e] transition-colors">关于开展2026年度学会分会会费收缴工作的通知</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">请各分会、专业委员会及全体会员登录服务门户及时缴纳2026年度会费...</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-white border-l-4 border-[#002B49] rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("branches")}>
                <div className="flex flex-col items-center justify-center bg-slate-100 w-12 h-12 rounded-lg flex-shrink-0">
                  <span className="font-bold text-[#002B49] text-sm">15</span>
                  <span className="text-[9px] text-slate-500 font-bold">MAY</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#002B49] hover:text-[#715a3e] transition-colors">第十五届全国微体古生物学学术研讨会一号通知</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">研讨会将于2026年11月在南京召开，摘要提交及早期注册现已开放...</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );

  // ==========================================================================
  // RENDER: MEMBER SERVICES (code2 + code7 + code10)
  // ==========================================================================
  // RENDER: MEMBER SERVICES — 统一学会会费 + 分会绑定
  // ==========================================================================
  const renderMemberServices = () => {
    if (!isLoggedIn) {
      return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
          <h2 className="text-xl font-bold text-[#002B49] mb-2">请先登录</h2>
          <p className="text-xs text-slate-500 mb-6">登录后可申请成为中国古生物学会会员，并自由绑定您感兴趣的专业分会。</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setDialogOpenTab("login"); setDialogOpen(true); }} className="bg-[#002B49] hover:bg-[#001f35] text-white px-6 py-2 rounded font-bold text-xs shadow-md">
              登录账号
            </button>
            <button onClick={() => { setDialogOpenTab("register"); setDialogOpen(true); }} className="border border-[#002B49] text-[#002B49] hover:bg-slate-50 px-6 py-2 rounded font-bold text-xs">
              注册账号
            </button>
          </div>
        </div>
      );
    }

    const isMemberActive = societyMembership?.status === "active";
    const isMemberPending = societyMembership?.status === "voucher_submitted" || societyMembership?.status === "invoice_submitted" || societyMembership?.status === "pending";
    const isMemberRejected = societyMembership?.status === "voucher_rejected" || societyMembership?.status === "invoice_rejected" || societyMembership?.status === "rejected";
    const isMemberInvoicePending = societyMembership?.status === "invoice_pending";
    const isMemberInvoiceOverdue = societyMembership?.status === "invoice_overdue";
    const isMemberExpired = societyMembership?.status === "expired";
    const hasApplied = isMemberActive || isMemberPending || isMemberRejected || isMemberInvoicePending || isMemberInvoiceOverdue || isMemberExpired;

    // ── 缴费流程 ──────────────────────────────────────────────────────────────
    if (showFeePayment === "society") {
      const SOCIETY_FEE = getMembershipFee("standard");

      const handleVoucherUpload = () => {
        setMemberVoucher("bank_transfer_receipt_2026.png");
        toast.success("缴费凭证银行回单上传成功！");
      };
      const handleInvoiceUpload = () => {
        if (societyMembership?.status !== "invoice_pending" && societyMembership?.status !== "invoice_overdue") {
          toast.error("请先等待凭证初审通过后再上传发票。");
          return;
        }
        setMemberInvoice("invoice_electronic_2026.pdf");
        submitMembershipInvoice(mockVoucherUrl);
        setMemberPayStep(1);
        setMemberVoucher(null);
        setMemberInvoice(null);
        setShowFeePayment(null);
      };
      const handlePaymentSubmit = () => {
        if (!memberVoucher) {
          toast.error("请先上传银行转账/汇款凭证截图或照片！");
          return;
        }
        // 两阶段：先提交凭证（阶段一）
        submitMembershipVoucher(mockVoucherUrl, SOCIETY_FEE);
        setMemberPayStep(1);
        setMemberVoucher(null);
        setMemberInvoice(null);
        setShowFeePayment(null);
      };

      return (
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="mb-8 text-xs text-slate-500 flex items-center gap-2">
            <button onClick={() => { setShowFeePayment(null); setMemberPayStep(1); }} className="hover:text-[#002B49] transition-colors">会员服务</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#002B49] font-bold">缴纳学会会费</span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-[#002B49] mb-2 font-serif">中国古生物学会 · 会费缴纳</h1>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto">缴纳一次统一会费，即成为中国古生物学会正式会员，可自由绑定任意专业分会，享受分会推送的会议通知与学术资讯。</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-200 -z-10"></div>
            {[
              { num: 1, label: "确认账户与金额" },
              { num: 2, label: "银行汇款/转账" },
              { num: 3, label: "上传凭证提交" },
              { num: 4, label: "上传发票" }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors border-2 ${
                  memberPayStep >= step.num ? "bg-[#002B49] text-white border-[#002B49]" : "bg-white text-slate-400 border-slate-200"
                }`}>{step.num}</div>
                <span className={`text-[10px] font-bold ${memberPayStep >= step.num ? "text-[#002B49]" : "text-slate-400"}`}>{step.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {memberPayStep === 1 && (
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="p-6 rounded-lg bg-slate-50 border border-[#E5E1DA]">
                  <div className="flex items-center space-x-2 mb-6">
                    <span className="material-symbols-outlined text-[#002B49]">account_balance</span>
                    <h2 className="text-base font-bold text-[#002B49]">缴费项目明细</h2>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">缴费项目</span>
                      <span className="font-bold text-[#002B49]">中国古生物学会会费</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">会员类型</span>
                      <span className="font-bold">个人会员（普通）</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">有效期</span>
                      <span className="font-bold">1 年（自审核通过之日起算）</span>
                    </div>
                    <div className="flex justify-between items-center bg-white border border-[#E5E1DA] p-3 rounded-lg mt-4">
                      <span className="font-bold text-[#002B49]">应缴会费金额</span>
                      <span className="text-xl font-bold text-[#002B49]">¥ {SOCIETY_FEE} 元</span>
                    </div>
                  </div>
                </section>

                <section className="p-6 rounded-lg bg-slate-50 border border-[#E5E1DA]">
                  <div className="flex items-center space-x-2 mb-6">
                    <span className="material-symbols-outlined text-[#002B49]">payments</span>
                    <h2 className="text-base font-bold text-[#002B49]">学会收款银行账户</h2>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-bold mb-1">户名</p>
                      <div className="font-bold text-[#002B49] flex justify-between items-center bg-white p-2 rounded border border-[#E5E1DA]">
                        <span>中国古生物学会</span>
                        <button onClick={() => { navigator.clipboard.writeText("中国古生物学会"); toast.success("户名已复制！"); }} className="text-[#715a3e] hover:underline text-[10px]">复制</button>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold mb-1">开户银行</p>
                      <p className="font-bold text-slate-700 bg-white p-2 rounded border border-[#E5E1DA]">中国工商银行南京成贤街支行</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold mb-1">银行账号</p>
                      <div className="font-bold text-[#002B49] flex justify-between items-center bg-white p-2 rounded border border-[#E5E1DA]">
                        <span>4301 0108 0900 1146 512</span>
                        <button onClick={() => { navigator.clipboard.writeText("4301 0108 0900 1146 512"); toast.success("银行账号已复制！"); }} className="text-[#715a3e] hover:underline text-[10px]">复制</button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg mt-6 text-xs text-amber-800 leading-relaxed">
                <span className="material-symbols-outlined align-middle text-sm mr-1">info</span>
                <strong>重要提示：</strong>请通过手机银行或柜台进行线下汇款转账，备注填写：<strong>"{currentUser?.name} 学会会费"</strong>，以便财务快速认领。
              </div>

              <div className="flex justify-center space-x-4 mt-10">
                <button onClick={() => { setShowFeePayment(null); setMemberPayStep(1); }} className="px-8 py-2.5 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all">
                  取消返回
                </button>
                <button onClick={() => setMemberPayStep(2)} className="px-8 py-2.5 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg font-bold text-xs transition-all shadow-md">
                  已完成汇款，下一步上传凭证
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {memberPayStep === 2 && (
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm text-center">
              <span className="material-symbols-outlined text-5xl text-[#002B49] mb-4">account_balance_wallet</span>
              <h2 className="text-lg font-bold text-[#002B49] mb-4">汇款转账确认</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                请确认已向学会账户汇入 <strong>¥ {SOCIETY_FEE} 元</strong> 会费。<br />
                汇出后请点击下方按钮，上传汇款成功的电子回单截图或手机银行截图。
              </p>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setMemberPayStep(1)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs">上一步</button>
                <button onClick={() => setMemberPayStep(3)} className="px-6 py-2 bg-[#002B49] text-white rounded-lg font-bold text-xs shadow-md">汇款已完成，去上传凭证</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {memberPayStep === 3 && (
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-[#002B49] mb-6 text-center">阶段一：上传汇款回单凭证</h2>
              <div className="max-w-lg mx-auto space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <strong>提示：</strong>先上传汇款凭证等待初审，初审通过后再上传电子发票（阶段二）。
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">汇款/转账凭证回单（必传）*</label>
                  <div onClick={handleVoucherUpload} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${memberVoucher ? "border-green-500 bg-green-50/20" : "border-slate-300 hover:bg-slate-50 hover:border-[#002B49]"}`}>
                    {memberVoucher ? (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
                        <p className="text-xs font-bold text-green-700">已上传：{memberVoucher}</p>
                        <p className="text-[10px] text-slate-400 mt-1">点击可重新上传</p>
                      </div>
                    ) : (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
                        <p className="text-xs font-bold text-[#002B49]">点击模拟上传转账电子回单</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持 JPG/PNG 格式，单张 ≤ 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center space-x-4 pt-6 border-t border-slate-100">
                  <button onClick={() => setMemberPayStep(2)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs">上一步</button>
                  <button onClick={handlePaymentSubmit} className="px-8 py-2 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg font-bold text-xs shadow-md">提交凭证，等待初审</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 上传电子发票（凭证初审通过后） */}
          {memberPayStep === 4 && (
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-[#002B49] mb-6 text-center">上传电子发票</h2>
              <div className="max-w-lg mx-auto space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                  <p className="font-bold mb-1">凭证初审已通过</p>
                  <p>请于 <strong>{societyMembership?.invoiceDeadline || "—"}</strong> 前上传电子发票（JPG/PNG/PDF ≤10MB）。</p>
                  {societyMembership?.invoiceExtendedDeadline && (
                    <p className="mt-1 text-blue-600">截止日已延期至：{societyMembership.invoiceExtendedDeadline}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">电子发票（必传）*</label>
                  <div onClick={() => {
                    setMemberInvoice("invoice_electronic_2026.pdf");
                    toast.success("电子发票上传成功！");
                  }} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${memberInvoice ? "border-green-500 bg-green-50/20" : "border-slate-300 hover:bg-slate-50 hover:border-[#002B49]"}`}>
                    {memberInvoice ? (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
                        <p className="text-xs font-bold text-green-700">已上传：{memberInvoice}</p>
                        <p className="text-[10px] text-slate-400 mt-1">点击可重新上传</p>
                      </div>
                    ) : (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">receipt_long</span>
                        <p className="text-xs font-bold text-[#002B49]">点击模拟上传电子发票</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式，单张 ≤ 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center space-x-4 pt-6 border-t border-slate-100">
                  <button onClick={() => setMemberPayStep(3)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs">上一步</button>
                  <button onClick={handleInvoiceUpload} disabled={!memberInvoice} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-md">
                    提交发票，等待终审
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── 会员主页面 ────────────────────────────────────────────────────────────
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: 个人信息 + 会员状态 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 个人信息卡 */}
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f5e0ba] opacity-10 rounded-full translate-x-8 -translate-y-8"></div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#002B49] text-white flex items-center justify-center font-bold text-2xl font-serif">
                  {currentUser?.name?.[0] || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#002B49]">{currentUser?.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{currentUser?.unit}</p>
                  {isMemberActive && (
                    <span className="inline-block bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">✓ 学会正式会员</span>
                  )}
                  {societyMembership?.status === "voucher_submitted" && (
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">⏳ 凭证初审中</span>
                  )}
                  {societyMembership?.status === "invoice_pending" && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">待上传发票</span>
                  )}
                  {societyMembership?.status === "invoice_overdue" && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">发票逾期</span>
                  )}
                  {societyMembership?.status === "invoice_submitted" && (
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">⏳ 发票终审中</span>
                  )}
                  {isMemberRejected && (
                    <span className="inline-block bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">✗ 凭证/发票被驳回</span>
                  )}
                  {isMemberExpired && (
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">会员已过期</span>
                  )}
                  {!hasApplied && (
                    <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">尚未入会</span>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">姓名</span>
                  <span className="font-bold text-slate-700">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">单位</span>
                  <span className="font-bold text-slate-700">{currentUser?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">电子邮箱</span>
                  <span className="font-bold text-slate-500">{currentUser?.email}</span>
                </div>
              </div>
            </div>

            {/* 学会会员状态卡 */}
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#002B49] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">card_membership</span> 学会会员状态
              </h3>

              {!hasApplied && (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_add</span>
                  <p className="text-xs text-slate-500 mb-4">您尚未申请成为学会会员。<br />缴纳一次会费，即可绑定所有分会。</p>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(1); }}
                    className="bg-[#002B49] hover:bg-[#001f35] text-white px-6 py-2 rounded font-bold text-xs shadow-md w-full"
                  >
                    立即申请入会（¥{getMembershipFee("standard")}/年）
                  </button>
                </div>
              )}

              {/* 凭证初审中 */}
              {societyMembership?.status === "voucher_submitted" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800 space-y-3">
                  <p className="font-bold mb-1">⏳ 凭证初审中</p>
                  <p className="text-yellow-700 leading-relaxed">您的汇款凭证已提交，请等待学会财务人工审核（通常 1-3 个工作日）。</p>
                  <div className="border-t border-yellow-200 pt-3">
                    <p className="text-yellow-400 text-[10px] mb-2">[ 演示模式 ] 模拟财务审核</p>
                    <div className="flex gap-2">
                      <button onClick={() => simApproveSocietyVoucher()} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span> 初审通过
                      </button>
                      <button onClick={() => simRejectSocietyVoucher("凭证模糊不清晰，无法辨认汇款信息。")} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">cancel</span> 初审驳回
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 待上传发票 + 可绑定分会 */}
              {isMemberInvoicePending && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 space-y-3">
                  <p className="font-bold mb-1">凭证初审已通过！</p>
                  <p className="text-blue-700 leading-relaxed">请于 <strong>{societyMembership?.invoiceDeadline}</strong> 前上传电子发票。您现在可以绑定专业分会。</p>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(4); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-xs"
                  >
                    上传电子发票
                  </button>
                </div>
              )}

              {/* 发票逾期 */}
              {isMemberInvoiceOverdue && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-xs text-orange-800 space-y-3">
                  <p className="font-bold mb-1">⚠ 发票上传已逾期</p>
                  <p className="text-orange-700 leading-relaxed">发票上传截止日 {societyMembership?.invoiceDeadline} 已过，会员资格暂时锁定。请尽快上传发票。</p>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(4); }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-bold text-xs"
                  >
                    立即上传发票
                  </button>
                </div>
              )}

              {/* 发票终审中 */}
              {societyMembership?.status === "invoice_submitted" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800 space-y-3">
                  <p className="font-bold mb-1">⏳ 发票终审中</p>
                  <p className="text-yellow-700 leading-relaxed">电子发票已提交，财务人员正在进行终审。终审通过后会员资格正式生效。</p>
                  <div className="border-t border-yellow-200 pt-3">
                    <p className="text-yellow-400 text-[10px] mb-2">[ 演示模式 ] 模拟财务终审</p>
                    <div className="flex gap-2">
                      <button onClick={() => simApproveSocietyInvoice()} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                        终审通过
                      </button>
                      <button onClick={() => simRejectSocietyInvoice("发票信息与凭证金额不符")} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                        终审驳回
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 驳回（凭证或发票） */}
              {isMemberRejected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-800 space-y-3">
                  <p className="font-bold">✗ {societyMembership?.status === "invoice_rejected" ? "发票终审被驳回" : "凭证初审被驳回"}</p>
                  <p className="text-red-700 leading-relaxed">驳回原因：{societyMembership?.voucherRejectReason || societyMembership?.invoiceRejectReason || societyMembership?.rejectReason || "凭证不清晰，请重新上传"}</p>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(societyMembership?.status === "invoice_rejected" ? 4 : 3); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-xs w-full"
                  >
                    {societyMembership?.status === "invoice_rejected" ? "重新上传发票" : "重新上传凭证"}
                  </button>
                </div>
              )}

              {isMemberActive && (
                <div className="space-y-3 text-xs">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-bold text-green-700 mb-1">✓ 会员资格有效</p>
                    <p className="text-green-600">有效期至：<strong>{societyMembership?.expiryDate}</strong></p>
                    <p className="text-green-600 mt-1">缴费金额：¥ {getMembershipFee("standard")} 元</p>
                  </div>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(1); }}
                    className="w-full text-xs text-[#002B49] font-bold hover:underline border border-slate-200 py-2 rounded-lg hover:bg-slate-50"
                  >
                    提前续费
                  </button>
                </div>
              )}

              {isMemberExpired && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-bold text-slate-600 mb-1">会员资格已过期</p>
                    <p className="text-slate-500">过期日期：{societyMembership?.expiryDate}</p>
                  </div>
                  <button
                    onClick={() => { setShowFeePayment("society"); setMemberPayStep(1); }}
                    className="bg-[#002B49] hover:bg-[#001f35] text-white px-4 py-2 rounded font-bold text-xs w-full"
                  >
                    立即续费（¥{getMembershipFee("standard")}/年）
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: 分会绑定管理 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-[#002B49]">专业分会绑定管理</h2>
                  <p className="text-slate-400 text-[10px] mt-1">
                    {isMemberActive
                      ? "您是学会正式会员，可自由绑定或解绑任意专业分会，绑定后自动接收该分会的会议通知与学术资讯。"
                      : "成为学会会员后，方可绑定专业分会。"}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                  已绑定 {boundBranches.length} / 11 个分会
                </span>
              </div>

              {!isMemberActive && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-xs text-amber-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 mt-0.5">lock</span>
                  <div>
                    <p className="font-bold">需要先成为学会会员</p>
                    <p className="mt-1">请在左侧申请入会并缴纳年费后，即可绑定专业分会。</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {branches.map((b) => {
                  const isBound = boundBranches.includes(b.id);
                  return (
                    <div key={b.id} className={`border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${isBound ? "border-green-300 bg-green-50/30" : "border-[#E5E1DA] bg-white"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#002B49] text-sm">{b.name}</h4>
                          {isBound && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">已绑定</span>}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{b.desc}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {isBound && (
                          <button
                            onClick={() => {
                              setConferenceBranchFilter(b.id);
                              setActiveTab("conference");
                              setSelectedConference(null);
                              setEditingReg(null);
                            }}
                            className="px-3 py-1.5 rounded font-bold text-xs border border-[#002B49] text-[#002B49] hover:bg-[#002B49] hover:text-white transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">event</span>查看会议
                          </button>
                        )}
                        {isMemberActive ? (
                          <button
                            onClick={() => {
                              toggleBranchBinding(b.id);
                              toast.success(isBound ? `已解绑"${b.name}"` : `已绑定"${b.name}"，将接收该分会推送`);
                            }}
                            className={`px-4 py-1.5 rounded font-bold text-xs transition-all ${
                              isBound
                                ? "border border-red-300 text-red-600 hover:bg-red-50"
                                : "bg-[#002B49] hover:bg-[#001f35] text-white shadow-sm"
                            }`}
                          >
                            {isBound ? "解绑分会" : "绑定分会"}
                          </button>
                        ) : (
                          <button disabled className="px-4 py-1.5 rounded font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200">
                            需先入会
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER: CONFERENCE SERVICES (code9 + code8 + code5)
  // ==========================================================================
  const renderConferenceServices = () => {
    // 1. CONFERENCE REGISTRATION FORM (code5 style)
    if (editingReg) {
      const conf = conferences.find(c => c.id === editingReg);
      const reg = conferenceRegs[editingReg] || { status: "unpaid" };

      const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitConferenceForm(editingReg, {
          name: regForm.name,
          gender: regForm.gender,
          unit: regForm.unit,
          role: regForm.role,
          accommodation: regForm.accommodation,
          session: regForm.session,
          presentationType: regForm.presentationType,
          reportTitle: regForm.reportTitle || undefined,
          abstractFileName: regForm.abstractFileName || undefined
        });
        setEditingReg(null);
      };

      const handleAbstractMockUpload = () => {
        const today = new Date().toISOString().split('T')[0];
        if (conf && today > conf.abstractDeadline) {
          toast.error(`摘要上传已截止（截止日期：${conf.abstractDeadline}）`);
          return;
        }
        const mockName = `Abstract_${currentUser?.name || "Member"}_2026.docx`;
        setRegForm((prev: any) => ({ ...prev, abstractFileName: mockName }));
        toast.success("学术论文摘要文件上传成功！");
      };

      const isAbstractDeadlineExceeded = () => {
        const today = new Date().toISOString().split('T')[0];
        return conf && today > conf.abstractDeadline;
      };

      return (
        <div className="max-w-3xl mx-auto py-12 px-6">
          <div className="mb-8 text-xs text-slate-500 flex items-center gap-2">
            <button onClick={() => setEditingReg(null)} className="hover:text-[#002B49] transition-colors">会议服务中心</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#002B49] font-bold">填写参会及报告信息</span>
          </div>

          <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">会议注册费已审核通过</span>
              <h2 className="text-lg font-bold text-[#002B49] mt-2">{conf?.title}</h2>
              <p className="text-xs text-slate-400 mt-1">请在下方填报您的具体参会形式、学术报告意向及酒店住宿代订信息。</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              {/* Profile Sync Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">参会人姓名 *</label>
                  <input 
                    type="text" 
                    value={regForm.name} 
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">工作/学习单位 *</label>
                  <input 
                    type="text" 
                    value={regForm.unit} 
                    onChange={(e) => setRegForm({ ...regForm, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">性别 *</label>
                  <select 
                    value={regForm.gender} 
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">参会人职务身份 *</label>
                  <select 
                    value={regForm.role} 
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                  >
                    <option value="教师">老师 / 科研人员</option>
                    <option value="学生">在读学生</option>
                    <option value="嘉宾">社会公众</option>
                  </select>
                </div>
              </div>

              {/* Presentation Form */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-sm text-[#002B49] mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">mic</span> 学术报告与论文摘要
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">报告交流形式 *</label>
                    <select 
                      value={regForm.presentationType} 
                      onChange={(e) => setRegForm({ ...regForm, presentationType: e.target.value as any })}
                      className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                    >
                      <option value="仅参会">仅列席参会 (Attendee Only)</option>
                      <option value="口头报告">大会口头报告 (Oral Presentation)</option>
                      <option value="展板报告">学术展板交流 (Poster)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">意向报告专场/分会场 *</label>
                    <select 
                      value={regForm.session} 
                      onChange={(e) => setRegForm({ ...regForm, session: e.target.value })}
                      className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                    >
                      <option value="古脊椎动物演化与环境专场">专题1：中生代陆相脊椎动物演化与重大环境事件</option>
                      <option value="微体古生物与能源油气勘探专场">专题2：微体古生物高精度生物地层与油气勘探</option>
                      <option value="早期生命辐射与澄江化石库专题">专题3：寒武纪大爆发与澄江生物群研究进展</option>
                    </select>
                  </div>
                </div>

                {regForm.presentationType !== "仅参会" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">报告论文题目 *</label>
                      <input 
                        type="text" 
                        value={regForm.reportTitle} 
                        onChange={(e) => setRegForm({ ...regForm, reportTitle: e.target.value })}
                        placeholder="请输入您的学术报告英文/中文完整题目"
                        className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">上传学术摘要文档 (.doc/.docx, ≤10MB) *</label>
                      <div className="space-y-2">
                        {!isAbstractDeadlineExceeded() ? (
                          <div className="flex gap-4 items-center">
                            <button 
                              type="button"
                              onClick={handleAbstractMockUpload}
                              className="px-4 py-2 border border-[#002B49] text-[#002B49] rounded font-bold hover:bg-slate-50 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">upload_file</span> 模拟上传摘要
                            </button>
                            {regForm.abstractFileName && (
                              <div className="flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded border border-green-200">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>{regForm.abstractFileName}</span>
                                <button type="button" onClick={() => setRegForm({ ...regForm, abstractFileName: "" })} className="text-red-500 hover:text-red-700 font-bold ml-2">删除</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm text-red-600 mt-0.5">error</span>
                            <div>
                              <p className="text-xs font-bold text-red-700">摘要上传已截止</p>
                              <p className="text-xs text-red-600 mt-1">截止日期：{conf?.abstractDeadline}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accommodation Form */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-sm text-[#002B49] mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">hotel</span> 住宿代订意向
                </h3>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">酒店住宿安排意向 *</label>
                  <select 
                    value={regForm.accommodation} 
                    onChange={(e) => setRegForm({ ...regForm, accommodation: e.target.value as any })}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                  >
                    <option value="自行安排">自行安排住宿 (不需要学会代订)</option>
                    <option value="单间">学会代订：大床单人间 (包间, 约 ¥450/晚)</option>
                    <option value="双人间">学会代订：标准双人间 (合住, 约 ¥240/晚)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setEditingReg(null)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold">
                  取消返回
                </button>
                <button type="submit" className="px-8 py-2 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg font-bold shadow-md">
                  提交参会信息
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // 2. CONFERENCE REGISTRATION PAYMENT (code7/11 style)
    if (confPaymentTarget) {
      const conf = conferences.find(c => c.id === confPaymentTarget);

      const handleConfVoucherUpload = () => {
        setConfVoucher("conference_wire_receipt_1200.png");
        toast.success("会议注册费汇款凭证上传成功！");
      };

      const handleConfInvoiceUpload = () => {
        setConfInvoice("invoice_title_school_tax_id.pdf");
        toast.success("开票单位税务信息上传成功！");
      };

      const handleConfPaymentSubmit = () => {
        if (!confVoucher) {
          toast.error("请先上传会议费银行转账汇款回单！");
          return;
        }
        payConference(confPaymentTarget, mockVoucherUrl, mockVoucherUrl, conf?.fee || 1000);
        
        // Reset local states
        setConfPaymentTarget(null);
        setConfVoucher(null);
        setConfInvoice(null);
        setConfPaymentStep(1);
      };

      return (
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="mb-8 text-xs text-slate-500 flex items-center gap-2">
            <button onClick={() => setConfPaymentTarget(null)} className="hover:text-[#002B49] transition-colors">会议服务中心</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#002B49] font-bold">缴纳会议注册费</span>
          </div>

          <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8 border-b border-slate-100 pb-4">
              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">第一步：线下汇款转账 ➔ 第二步：在此提交回单凭证</span>
              <h2 className="text-lg font-bold text-[#002B49] mt-2">缴纳会议注册费：{conf?.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-xs">
              <div className="bg-slate-50 p-5 rounded-lg border border-[#E5E1DA]">
                <h3 className="font-bold text-[#002B49] mb-4 flex items-center gap-1"><span className="material-symbols-outlined text-sm">receipt</span> 收费明细</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">会议费类别</span>
                    <span className="font-bold">正式代表注册费 (标准)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">应缴金额</span>
                    <span className="font-bold text-red-600">¥ {conf?.fee} 元</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#E5E1DA] leading-relaxed text-slate-500">
                    <strong>会费关联优惠：</strong>如果您已是古生物学会任意分会的“有效个人会员”，请在汇款备注中填写您的会员号，财务将核对并予以录用。
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-[#E5E1DA]">
                <h3 className="font-bold text-[#002B49] mb-4 flex items-center gap-1"><span className="material-symbols-outlined text-sm">account_balance</span> 学会收款银行账户</h3>
                <div className="space-y-2">
                  <p className="text-slate-500">户名：<strong>中国古生物学会</strong></p>
                  <p className="text-slate-500">开户行：<strong>中国工商银行南京成贤街支行</strong></p>
                  <p className="text-slate-500">账号：<strong>4301 0108 0900 1146 512</strong></p>
                  <p className="text-red-700 font-bold mt-2">汇款备注附言：{currentUser?.name} + {conf?.branchName}会议费</p>
                </div>
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">1. 会议费线下转账/汇款成功电子回单 *</label>
                <div 
                  onClick={handleConfVoucherUpload}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    confVoucher ? "border-green-500 bg-green-50/20" : "border-slate-300 hover:border-[#002B49]"
                  }`}
                >
                  {confVoucher ? (
                    <div className="text-green-700 font-bold text-xs flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined">check_circle</span>
                      已上传：{confVoucher}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">
                      <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">cloud_upload</span>
                      <p className="font-bold text-[#002B49]">点击模拟上传会议费银行汇款回单</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">2. 增值税电子普通发票开票抬头与税号 (选填)</label>
                <div 
                  onClick={handleConfInvoiceUpload}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    confInvoice ? "border-[#715a3e] bg-[#f5e0ba]/10" : "border-slate-300 hover:border-[#002B49]"
                  }`}
                >
                  {confInvoice ? (
                    <div className="text-[#715a3e] font-bold text-xs flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined">receipt</span>
                      已上传发票税号资料：{confInvoice}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">
                      <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">receipt_long</span>
                      <p className="font-bold">点击上传开票税号信息或单位证明</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-6 border-t border-slate-100">
                <button onClick={() => setConfPaymentTarget(null)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs">
                  取消返回
                </button>
                <button 
                  onClick={handleConfPaymentSubmit}
                  className="px-8 py-2 bg-[#002B49] text-white rounded-lg font-bold text-xs shadow-md"
                >
                  提交会议费审核
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. CONFERENCE DETAILS MODAL (code8 style)
    if (selectedConference) {
      const conf = conferences.find(c => c.id === selectedConference);
      const reg = conferenceRegs[selectedConference] || { status: "unpaid" };
      
      // Check if payment deadline has passed
      const today = new Date().toISOString().split('T')[0];
      const isPaymentDeadlineExceeded = conf && today > conf.feeDeadline;

      return (
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="mb-8 text-xs text-slate-500 flex items-center gap-2">
            <button onClick={() => setSelectedConference(null)} className="hover:text-[#002B49] transition-colors">会议服务中心</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#002B49] font-bold">会议详细通知</span>
          </div>

          <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
            <div className="border-b border-slate-100 pb-6 mb-6">
              <span className="bg-[#f5e0ba] text-[#241a03] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">PSC ACADEMIC CONFERENCE</span>
              <h1 className="text-2xl font-bold text-[#002B49] mt-3 font-serif">{conf?.title}</h1>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {conf?.time}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {conf?.location}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">sell</span> 注册费：¥ {conf?.fee} 元</span>
              </div>
            </div>

            {isPaymentDeadlineExceeded && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                <div>
                  <p className="text-xs font-bold text-red-700">缴费已截止</p>
                  <p className="text-xs text-red-600 mt-1">截止日期：{conf?.feeDeadline}</p>
                </div>
              </div>
            )}

            <div className="prose max-w-none text-xs text-slate-600 leading-relaxed space-y-4 mb-8">
              <h3 className="text-sm font-bold text-[#002B49] border-b border-slate-100 pb-2">一、会议主题与内容</h3>
              <p>{conf?.desc}</p>
              <h3 className="text-sm font-bold text-[#002B49] border-b border-slate-100 pb-2">二、会议缴费说明</h3>
              <p>请各参会代表于大会召开前通过银行线下汇款缴纳会议注册费，并在学会服务门户提交汇款成功凭证截图。初审通过后，即可在线填报详细的学术报告（口头报告/展板交流）题目、上传论文摘要并选择由学会统一代订周边协议酒店。</p>
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">缴费截止日期：<strong>{conf?.feeDeadline}</strong>，学术摘要截止日期：<strong>{conf?.abstractDeadline}</strong></p>
            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-between items-center flex-wrap gap-4">
              <button onClick={() => setSelectedConference(null)} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold text-xs">
                返回会议列表
              </button>

              <div className="flex gap-3">
                {/* UNPAID */}
                {reg.status === "unpaid" && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error("请先登录系统再报名会议。");
                        setDialogOpenTab("login");
                        setDialogOpen(true);
                        return;
                      }
                      if (isPaymentDeadlineExceeded) {
                        toast.error(`缴费已截止（截止日期：${conf?.feeDeadline}）`);
                        return;
                      }
                      setConfPaymentTarget(conf!.id);
                    }}
                    disabled={isPaymentDeadlineExceeded}
                    className={`px-6 py-2 rounded-lg font-bold text-xs shadow-md ${
                      isPaymentDeadlineExceeded
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-[#002B49] hover:bg-[#001f35] text-white"
                    }`}
                  >
                    {isPaymentDeadlineExceeded ? "缴费已截止" : "立即缴纳注册费报名"}
                  </button>
                )}

                {/* VOUCHER SUBMITTED — 凭证初审中 */}
                {(reg.status === "voucher_submitted" || reg.status === "pending") && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 space-y-2 w-full">
                    <p className="font-bold">⏳ 凭证初审中</p>
                    <p className="text-yellow-600">汇款凭证已提交，财务初审中（通常 1-3 个工作日）。</p>
                    <div className="border-t border-yellow-200 pt-2">
                      <p className="text-yellow-400 text-[10px] mb-1.5">[ 演示模式 ] 模拟财务初审</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => simApproveConferenceVoucher(conf!.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                          初审通过
                        </button>
                        <button onClick={() => simRejectConferenceVoucher(conf!.id, "凭证模糊，无法辨认汇款信息")} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                          初审驳回
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* VOUCHER REJECTED — 凭证被驳回 */}
                {reg.status === "voucher_rejected" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-2 w-full">
                    <p className="font-bold">✗ 凭证初审被驳回</p>
                    {reg.voucherRejectReason && <p className="text-red-600">原因：{reg.voucherRejectReason}</p>}
                    <button onClick={() => setConfPaymentTarget(conf!.id)} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-bold text-xs">
                      重新上传凭证
                    </button>
                  </div>
                )}

                {/* INVOICE PENDING — 待上传发票（可填参会信息） */}
                {reg.status === "invoice_pending" && (
                  <div className="space-y-2 w-full">
                    {/* 倒计时 */}
                    {(() => {
                      const deadline = reg.invoiceExtendedDeadline || reg.invoiceDeadline;
                      if (deadline) {
                        const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysLeft <= 3;
                        return (
                          <div className={`rounded-lg p-2 text-xs font-bold text-center ${isUrgent ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                            <span className="material-symbols-outlined text-[13px] align-middle mr-1">schedule</span>
                            {daysLeft > 0 ? `发票上传截止：${deadline}（剩余 ${daysLeft} 天）` : `发票上传已逾期！截止日：${deadline}`}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="flex gap-2">
                      <button onClick={() => setEditingReg(conf!.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">edit_note</span> 填写参会信息
                      </button>
                      <button onClick={() => {
                        setConfInvoice("invoice_electronic_conf.pdf");
                        submitConferenceInvoice(conf!.id, mockVoucherUrl);
                      }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">receipt_long</span> 上传发票
                      </button>
                    </div>
                    {/* 演示按钮 */}
                    <div className="border-t border-slate-100 pt-1.5">
                      <p className="text-slate-400 text-[10px] mb-1">[ 演示 ] 模拟发票终审</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => simApproveConferenceInvoice(conf!.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-bold text-xs">
                          终审通过
                        </button>
                        <button onClick={() => simRejectConferenceInvoice(conf!.id, "发票信息与汇款人不符")} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold text-xs">
                          终审驳回
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* INVOICE OVERDUE — 发票逾期 */}
                {reg.status === "invoice_overdue" && (
                  <div className="space-y-2 w-full">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                      <p className="font-bold">⚠ 发票上传已逾期</p>
                      <p className="text-orange-700 mt-1">截止日：{reg.invoiceDeadline || "—"}。请尽快上传发票完成报名确认。</p>
                    </div>
                    <button onClick={() => {
                      setConfInvoice("invoice_electronic_conf.pdf");
                      submitConferenceInvoice(conf!.id, mockVoucherUrl);
                    }} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold text-xs">
                      立即上传发票
                    </button>
                  </div>
                )}

                {/* INVOICE SUBMITTED — 发票终审中 */}
                {reg.status === "invoice_submitted" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 space-y-2 w-full">
                    <p className="font-bold">⏳ 发票终审中</p>
                    <p className="text-yellow-600">电子发票已提交，财务终审中。已填写的参会信息已锁定。</p>
                    <div className="border-t border-yellow-200 pt-2">
                      <p className="text-yellow-400 text-[10px] mb-1.5">[ 演示模式 ] 模拟财务终审</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => simApproveConferenceInvoice(conf!.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                          终审通过
                        </button>
                        <button onClick={() => simRejectConferenceInvoice(conf!.id, "发票信息不一致")} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1">
                          终审驳回
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* INVOICE REJECTED — 发票被驳回 */}
                {reg.status === "invoice_rejected" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-2 w-full">
                    <p className="font-bold">✗ 发票终审被驳回</p>
                    {reg.invoiceRejectReason && <p className="text-red-600">原因：{reg.invoiceRejectReason}</p>}
                    <button onClick={() => {
                      setConfInvoice("invoice_electronic_conf_v2.pdf");
                      submitConferenceInvoice(conf!.id, mockVoucherUrl);
                    }} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-bold text-xs">
                      重新上传发票
                    </button>
                  </div>
                )}

                {/* CONFIRMED — 报名确认 */}
                {(reg.status === "confirmed" || reg.status === "submitted" || reg.status === "approved_unfilled" || reg.status === "approved_invoice") && (
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 font-bold text-xs flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {reg.status === "confirmed" ? "✓ 报名已确认" : "已成功报名"}
                    </span>
                    <button
                      onClick={() => setEditingReg(conf!.id)}
                      className="text-xs text-[#002B49] font-bold hover:underline"
                    >
                      {reg.status === "confirmed" ? "查看参会信息" : "修改参会信息"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. GENERAL CONFERENCE LIST (code9 style)
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-[#002B49]">学术会议服务中心</h2>
          <p className="text-slate-400 text-xs mt-1">您可以在线报名参加中国古生物学会及各学术分会主办的全国及国际学术大会。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conferences.map((c) => {
            const reg = conferenceRegs[c.id] || { status: "unpaid" };

            return (
              <div key={c.id} className="bg-white border border-[#E5E1DA] hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="bg-[#002B49] text-white p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none"></div>
                  <span className="bg-[#f5e0ba] text-[#241a03] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {c.branchName}
                  </span>
                  <h3 className="font-bold text-sm mt-3 leading-snug h-12 line-clamp-2">{c.title}</h3>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between text-xs text-slate-600">
                  <div className="space-y-2 mb-6">
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-slate-400 text-sm">schedule</span> {c.time}</p>
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-slate-400 text-sm">location_on</span> {c.location}</p>
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-slate-400 text-sm">sell</span> 注册费：<strong>¥ {c.fee} 元</strong></p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => setSelectedConference(c.id)}
                      className="text-[#715a3e] font-bold hover:underline flex items-center gap-0.5"
                    >
                      详细通知 <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>

                    {/* STATUS BUTTONS — 8种状态 */}
                    <div>
                      {reg.status === "unpaid" && (
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error("请先登录系统再报名会议。");
                              setDialogOpenTab("login");
                              setDialogOpen(true);
                              return;
                            }
                            setConfPaymentTarget(c.id);
                          }}
                          className="bg-[#002B49] hover:bg-[#001f35] text-white px-4 py-1.5 rounded font-bold text-[10px] shadow-sm"
                        >
                          报名参会
                        </button>
                      )}

                      {(reg.status === "voucher_submitted" || reg.status === "pending") && (
                        <span className="text-yellow-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span> 凭证初审中
                        </span>
                      )}

                      {reg.status === "voucher_rejected" && (
                        <span className="text-red-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">error</span> 凭证被驳回
                        </span>
                      )}

                      {reg.status === "invoice_pending" && (
                        <span className="text-blue-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">receipt_long</span> 待上传发票
                        </span>
                      )}

                      {reg.status === "invoice_overdue" && (
                        <span className="text-orange-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">warning</span> 发票逾期
                        </span>
                      )}

                      {reg.status === "invoice_submitted" && (
                        <span className="text-yellow-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span> 发票终审中
                        </span>
                      )}

                      {reg.status === "invoice_rejected" && (
                        <span className="text-red-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">error</span> 发票被驳回
                        </span>
                      )}

                      {(reg.status === "confirmed" || reg.status === "submitted" || reg.status === "approved_unfilled" || reg.status === "approved_invoice") && (
                        <span className="text-green-600 font-bold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-sm">check_circle</span> {reg.status === "confirmed" ? "已确认" : "已报名"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER: CONFERENCE LIST (filtered by bound branches)
  // ==========================================================================
  const renderConferenceList = () => {
    const isActiveMember = societyMembership.status === "active";
    // Find the name of the currently filtered branch
    const filteredBranchName = conferenceBranchFilter
      ? branches.find(b => b.id === conferenceBranchFilter)?.name || conferenceBranchFilter
      : null;
    // Filter logic: if conferenceBranchFilter is set, show only that branch's conferences;
    // otherwise show all bound-branch conferences (or all if not a member)
    const visibleConfs = conferenceBranchFilter
      ? conferences.filter(c => c.branchId === conferenceBranchFilter)
      : isActiveMember
        ? conferences.filter(c => boundBranches.includes(c.branchId))
        : conferences;

    const statusColor: Record<string, string> = {
      "演示": "bg-blue-50 text-blue-700",
      "正在报名": "bg-green-50 text-green-700",
      "即将开启": "bg-amber-50 text-amber-700",
      "预告通知": "bg-slate-100 text-slate-500",
    };

    return (
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#002B49] mb-2" style={{ fontFamily: "Georgia, serif" }}>学术会议</h2>
            <p className="text-slate-500 text-xs">
              {conferenceBranchFilter
                ? `当前显示「${filteredBranchName}」的会议。`
                : isActiveMember
                  ? `显示您已绑定分会的会议（已绑定 ${boundBranches.length} 个分会）。绑定更多分会可见更多会议。`
                  : "成为学会会员并绑定分会后，可查看对应分会的会议并缴纳注册费。以下展示全部公开会议。"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {conferenceBranchFilter && (
              <button
                onClick={() => setConferenceBranchFilter(null)}
                className="text-xs font-bold text-slate-600 border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                清除筛选
              </button>
            )}
            {isActiveMember && (
              <button
                onClick={() => setActiveTab("member")}
                className="text-xs font-bold text-[#002B49] border border-[#002B49] px-3 py-1.5 rounded hover:bg-[#002B49] hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">hub</span>
                管理分会绑定
              </button>
            )}
          </div>
        </div>

        {/* Branch filter indicator banner */}
        {conferenceBranchFilter && (
          <div className="mb-6 bg-[#002B49]/5 border border-[#002B49]/20 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[#002B49] text-[18px]">filter_list</span>
              <span className="text-slate-600">当前筛选：</span>
              <span className="font-bold text-[#002B49] bg-[#002B49]/10 px-2.5 py-0.5 rounded-full">{filteredBranchName}</span>
              {visibleConfs.length === 0 && (
                <span className="text-slate-400 ml-2">该分会暂无公开会议</span>
              )}
              {visibleConfs.length > 0 && (
                <span className="text-slate-400 ml-2">共 {visibleConfs.length} 场会议</span>
              )}
            </div>
            <button
              onClick={() => setConferenceBranchFilter(null)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5 font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>查看全部分会会议
            </button>
          </div>
        )}

        {visibleConfs.length === 0 && (
          <div className="bg-white border border-[#E5E1DA] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">event_busy</span>
            {conferenceBranchFilter ? (
              <>
                <p className="text-slate-500 font-bold text-sm mb-1">「{filteredBranchName}」暂无公开会议</p>
                <p className="text-slate-400 text-xs mb-4">该分会目前没有已发布的学术会议，请关注分会动态。</p>
                <button
                  onClick={() => setConferenceBranchFilter(null)}
                  className="bg-[#002B49] text-white px-4 py-2 rounded font-bold text-xs hover:bg-[#003d6b] transition-colors"
                >
                  查看全部分会会议
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-500 font-bold text-sm mb-1">暂无可查看的会议</p>
                <p className="text-slate-400 text-xs mb-4">请先前往「会员服务」绑定您感兴趣的专业分会，即可接收对应分会的会议通知。</p>
                <button
                  onClick={() => setActiveTab("member")}
                  className="bg-[#002B49] text-white px-4 py-2 rounded font-bold text-xs hover:bg-[#003d6b] transition-colors"
                >
                  前往绑定分会
                </button>
              </>
            )}
          </div>
        )}

        <div className="space-y-4">
          {visibleConfs.map(c => {
            const reg = conferenceRegs[c.id];
            const isBound = boundBranches.includes(c.branchId);
            const canPay = isActiveMember && isBound && !reg;
            return (
              <div key={c.id} className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[c.status] || "bg-slate-100 text-slate-500"}`}>{c.status}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#002B49]/8 text-[#002B49]">{c.branchName}</span>
                      {reg && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          CONFERENCE_STATUS_COLOR[reg.status] ||
                          (reg.status === "active" ? "bg-green-50 text-green-700" :
                           reg.status === "pending" ? "bg-amber-50 text-amber-700" :
                           reg.status === "submitted" ? "bg-blue-50 text-blue-700" :
                           "bg-slate-50 text-slate-600")
                        }`}>
                          {CONFERENCE_STATUS_LABEL[reg.status] ||
                           (reg.status === "active" ? "✓ 已缴费" : reg.status === "pending" ? "⏳ 审核中" : reg.status === "submitted" ? "✓ 已报名" : reg.status)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#002B49] text-base mb-2">{c.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{c.desc}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_month</span>{c.time}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{c.location}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">payments</span>注册费 ¥{c.fee}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>缴费截止 {c.feeDeadline}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {!isActiveMember && (
                      <button
                        onClick={() => setActiveTab("member")}
                        className="bg-[#002B49] text-white px-4 py-2 rounded font-bold text-xs hover:bg-[#003d6b] transition-colors text-center"
                      >
                        先加入会员
                      </button>
                    )}
                    {isActiveMember && !isBound && (
                      <button
                        onClick={() => setActiveTab("member")}
                        className="border border-[#002B49] text-[#002B49] px-4 py-2 rounded font-bold text-xs hover:bg-[#002B49] hover:text-white transition-colors text-center"
                      >
                        绑定分会后可报名
                      </button>
                    )}
                    {canPay && (
                      <button
                        onClick={() => { setConfPaymentTarget(c.id); setConfPaymentStep(1); setConfVoucher(null); setConfInvoice(null); }}
                        className="bg-[#c8a96e] hover:bg-[#b8956a] text-white px-4 py-2 rounded font-bold text-xs transition-colors text-center"
                      >
                        缴纳注册费
                      </button>
                    )}
                    {/* 凭证初审中 → 可模拟审核通过 */}
                    {(reg?.status === "voucher_submitted" || reg?.status === "pending") && (
                      <>
                        <span className="text-amber-600 font-bold text-[10px] text-center">⏳ 凭证初审中</span>
                        <button
                          onClick={() => simApproveConferenceVoucher(c.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-[10px] transition-colors"
                        >
                          ✓ 模拟凭证通过
                        </button>
                      </>
                    )}
                    {/* 凭证被驳回 → 可重新提交 */}
                    {reg?.status === "voucher_rejected" && (
                      <>
                        <span className="text-red-600 font-bold text-[10px] text-center">✕ 凭证被驳回</span>
                        <button
                          onClick={() => { setConfPaymentTarget(c.id); setConfPaymentStep(1); setConfVoucher(null); setConfInvoice(null); }}
                          className="bg-[#c8a96e] hover:bg-[#b8956a] text-white px-4 py-2 rounded font-bold text-xs transition-colors text-center"
                        >
                          重新提交凭证
                        </button>
                      </>
                    )}
                    {/* 待上传发票 → 填写信息 + 上传发票 + 模拟发票审核 */}
                    {reg?.status === "invoice_pending" && (
                      <>
                        <button
                          onClick={() => setEditingReg(c.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-xs transition-colors text-center"
                        >
                          填写参会信息
                        </button>
                        {reg.invoiceDeadline && (
                          <span className="text-blue-600 font-bold text-[10px] text-center">发票截止：{reg.invoiceDeadline}</span>
                        )}
                      </>
                    )}
                    {/* 发票逾期 */}
                    {reg?.status === "invoice_overdue" && (
                      <span className="text-orange-600 font-bold text-[10px] text-center">⚠ 发票已逾期</span>
                    )}
                    {/* 发票终审中 */}
                    {reg?.status === "invoice_submitted" && (
                      <>
                        <span className="text-amber-600 font-bold text-[10px] text-center">⏳ 发票终审中</span>
                        <button
                          onClick={() => simApproveConferenceInvoice(c.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-[10px] transition-colors"
                        >
                          ✓ 模拟终审通过
                        </button>
                      </>
                    )}
                    {/* 发票被驳回 → 可重新上传 */}
                    {reg?.status === "invoice_rejected" && (
                      <>
                        <span className="text-red-600 font-bold text-[10px] text-center">✕ 发票被驳回</span>
                        <button
                          onClick={() => { setConfPaymentTarget(c.id); setConfPaymentStep(3); setConfVoucher(null); setConfInvoice(null); }}
                          className="bg-[#c8a96e] hover:bg-[#b8956a] text-white px-4 py-2 rounded font-bold text-xs transition-colors text-center"
                        >
                          重新上传发票
                        </button>
                      </>
                    )}
                    {/* 已确认 */}
                    {reg?.status === "confirmed" && (
                      <span className="text-green-600 font-bold text-[10px] text-center flex items-center gap-1 justify-center">
                        <span className="material-symbols-outlined text-sm">check_circle</span>报名完成
                      </span>
                    )}
                    {/* 旧状态兼容 */}
                    {reg?.status === "active" && !reg.conferenceForm && (
                      <button
                        onClick={() => setEditingReg(c.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-xs transition-colors text-center"
                      >
                        填写参会信息
                      </button>
                    )}
                    {reg?.status === "submitted" && (
                      <span className="text-green-600 font-bold text-[10px] text-center flex items-center gap-1 justify-center">
                        <span className="material-symbols-outlined text-sm">check_circle</span>报名完成
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline conference payment dialog */}
        {confPaymentTarget && (() => {
          const c = conferences.find(x => x.id === confPaymentTarget)!;
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[#E5E1DA] flex items-center justify-between">
                  <h3 className="font-bold text-[#002B49] text-base">缴纳会议注册费</h3>
                  <button onClick={() => setConfPaymentTarget(null)} className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-[#FCFAF7] rounded-lg p-4 text-xs space-y-2">
                    <p className="font-bold text-[#002B49]">{c.title}</p>
                    <p className="text-slate-500">{c.time} · {c.location}</p>
                    <p className="text-lg font-bold text-[#c8a96e]">¥{c.fee}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-xs">
                    <p className="font-bold text-blue-800 mb-1">收款账户信息</p>
                    <p className="text-blue-700">开户名称：中国古生物学会</p>
                    <p className="text-blue-700">开户行：中国工商银行南京分行</p>
                    <p className="text-blue-700">账号：3210 0000 0000 0000</p>
                    <p className="text-blue-700">汇款备注：{c.title}注册费</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">上传缴费凭证 *</label>
                    <div
                      className="border-2 border-dashed border-[#E5E1DA] rounded-lg p-4 text-center cursor-pointer hover:border-[#c8a96e] transition-colors"
                      onClick={() => setConfVoucher("voucher_uploaded.jpg")}
                    >
                      {confVoucher ? (
                        <p className="text-green-600 font-bold text-xs">✓ {confVoucher}</p>
                      ) : (
                        <p className="text-slate-400 text-xs">点击上传凭证图片（JPG/PNG ≪5MB）</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">上传电子发票（可选）</label>
                    <div
                      className="border-2 border-dashed border-[#E5E1DA] rounded-lg p-4 text-center cursor-pointer hover:border-[#c8a96e] transition-colors"
                      onClick={() => setConfInvoice("invoice_uploaded.pdf")}
                    >
                      {confInvoice ? (
                        <p className="text-green-600 font-bold text-xs">✓ {confInvoice}</p>
                      ) : (
                        <p className="text-slate-400 text-xs">点击上传发票（JPG/PNG/PDF ≪10MB）</p>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!confVoucher}
                    onClick={() => {
                      if (confVoucher) {
                        payConference(confPaymentTarget, confVoucher, confInvoice || "", c.fee);
                        setConfPaymentTarget(null);
                      }
                    }}
                    className="w-full bg-[#002B49] hover:bg-[#003d6b] disabled:opacity-40 text-white py-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    提交凳证，等待审核
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Inline conference form dialog */}
        {editingReg && (() => {
          const c = conferences.find(x => x.id === editingReg);
          if (!c) return null;
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[#E5E1DA] flex items-center justify-between">
                  <h3 className="font-bold text-[#002B49] text-base">填写参会信息</h3>
                  <button onClick={() => setEditingReg(null)} className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-500 mb-4">{c.title}</p>
                  <div className="space-y-3 text-xs">
                    <div><label className="font-bold text-slate-700 block mb-1">报告类型</label>
                      <select className="w-full border border-[#E5E1DA] rounded px-3 py-2">
                        <option>口头报告</option><option>展板报告</option><option>仅参会</option>
                      </select>
                    </div>
                    <div><label className="font-bold text-slate-700 block mb-1">住宿需求</label>
                      <select className="w-full border border-[#E5E1DA] rounded px-3 py-2">
                        <option>单间</option><option>双人间</option><option>自行安排</option>
                      </select>
                    </div>
                    <div><label className="font-bold text-slate-700 block mb-1">报告标题（可选）</label>
                      <input type="text" placeholder="请输入报告标题" className="w-full border border-[#E5E1DA] rounded px-3 py-2" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      submitConferenceForm(editingReg, { name: currentUser?.name || "", gender: currentUser?.gender || "男", unit: currentUser?.unit || "", role: currentUser?.role || "教师", accommodation: "单间", session: "古脊椎动物演化与环境专场", presentationType: "口头报告", reportTitle: undefined, abstractFileName: undefined });
                      setEditingReg(null);
                    }}
                    className="w-full mt-4 bg-[#002B49] hover:bg-[#003d6b] text-white py-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    提交参会信息
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ==========================================================================
  // RENDER: SCIENCE COMMUNICATION (code4 style)
  // ==========================================================================
  const renderScienceComm = () => (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 space-y-2">
          <h2 className="text-base font-bold text-[#002B49] mb-4 border-b border-[#E5E1DA] pb-2">科学传播大纲</h2>
          <button className="w-full text-left px-4 py-2 bg-[#002B49] text-white rounded font-bold flex justify-between items-center text-xs">科普动态 <span className="material-symbols-outlined text-sm">arrow_right_alt</span></button>
          <button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded font-bold flex justify-between items-center text-xs">科普期刊 <span className="material-symbols-outlined text-sm">chevron_right</span></button>
          <button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded font-bold flex justify-between items-center text-xs">科普基地 <span className="material-symbols-outlined text-sm">chevron_right</span></button>
          <button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded font-bold flex justify-between items-center text-xs">科普精品文章 <span className="material-symbols-outlined text-sm">chevron_right</span></button>
          <button className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded font-bold flex justify-between items-center text-xs">化石保护与利用 <span className="material-symbols-outlined text-sm">chevron_right</span></button>
        </div>
        
        <div className="w-full md:w-3/4 space-y-8 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E1DA] p-6 rounded-lg">
              <h3 className="text-sm font-bold text-[#002B49] mb-2">《Palaeoworld》</h3>
              <p className="text-slate-500 mb-4 h-16 leading-relaxed">中国古生物学会主办的国际性英文学术期刊，侧重古生物学及地层学前沿研究成果发布。</p>
              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">SCIE 收录 · Q1分区</span>
            </div>
            <div className="bg-white border border-[#E5E1DA] p-6 rounded-lg">
              <h3 className="text-sm font-bold text-[#002B49] mb-2">《古生物学报》</h3>
              <p className="text-slate-500 mb-4 h-16 leading-relaxed">创刊于1953年，是我国古生物学领域历史最悠久的综合性学术期刊。</p>
              <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">中文核心期刊</span>
            </div>
            <div className="bg-white border border-[#E5E1DA] p-6 rounded-lg">
              <h3 className="text-sm font-bold text-[#002B49] mb-2">《化石》科普杂志</h3>
              <p className="text-slate-500 mb-4 h-16 leading-relaxed">面向社会公众的高端科普读物，以生动的语言和精美插图讲述进化故事。</p>
              <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded text-[10px]">全国优秀科普期刊</span>
            </div>
          </div>

          <div className="border-t border-[#E5E1DA] pt-6">
            <h3 className="font-bold text-[#002B49] text-sm mb-4">科普基地工作动态</h3>
            <div className="bg-white border border-[#E5E1DA] p-5 rounded-lg flex gap-4 items-center">
              <span className="material-symbols-outlined text-4xl text-[#715a3e]">explore</span>
              <div>
                <h4 className="font-bold text-[#002B49] text-xs">全国古生物科普基地申报与复核管理系统</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">中国古生物学会科普基地旨在联合全国各级自然博物馆、地质公园、科研机构，向社会公众普及地球历史生命进化知识。系统提供在线申报入口及科普大纲下载。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================================================
  // RENDER: ADMIN SIMULATOR PANEL (Interactive Demo helper)
  // ==========================================================================
  const renderAdminDashboard = () => {
    const handleApproveMemberSim = () => {
      simApproveSocietyMembership();
    };
    const handleRejectMemberSim = () => {
      simRejectSocietyMembership(simRejectReason);
    };
    const handleApproveConfSim = () => {
      simApproveConference(simConfId);
    };
    const handleRejectConfSim = () => {
      simRejectConference(simConfId, simRejectReason);
    };

    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="bg-[#002B49] text-white text-[9px] font-bold px-2 py-0.5 rounded">演示沙盒工具</span>
            <h2 className="text-lg font-bold text-[#002B49] mt-2">审核流程模拟器</h2>
            <p className="text-xs text-slate-400 mt-1">本工具用于演示审核流程，模拟管理员对当前登录用户的"学会会费凭证"和"会议费凭证"进行批准或驳回，以便完整演示业务流转。</p>
            <p className="text-xs text-blue-600 mt-1 font-bold">当前操作账号：{currentUser?.email || "未登录"}</p>
          </div>

          <div className="space-y-6 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1">驳回说明原因（仅在点击"驳回"时生效）</label>
              <input
                type="text"
                value={simRejectReason}
                onChange={(e) => setSimRejectReason(e.target.value)}
                className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
              />
            </div>

            {/* Society Membership Audit */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-[#002B49] mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">card_membership</span> 1. 模拟审核学会会费凭证
              </h3>
              <p className="text-slate-400 mb-3">对当前登录用户提交的"学会会费"凭证进行审核操作。</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button onClick={handleApproveMemberSim} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold shadow-sm">
                  ✓ 批准入会（1年有效期）
                </button>
                <button onClick={handleRejectMemberSim} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold shadow-sm">
                  ✗ 驳回凭证
                </button>
              </div>
            </div>

            {/* Conference Audit */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-[#002B49] mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">groups_3</span> 2. 模拟审核会议注册费凭证
              </h3>
              <p className="text-slate-400 mb-3">选择会议，对当前登录用户的会议费凭证进行审核。</p>
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={simConfId}
                  onChange={(e) => setSimConfId(e.target.value)}
                  className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-slate-700"
                >
                  {conferences.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button onClick={handleApproveConfSim} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold shadow-sm">
                  ✓ 批准（允许填写参会信息）
                </button>
                <button onClick={handleRejectConfSim} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold shadow-sm">
                  ✗ 驳回
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ==========================================================================
  // RENDER: INTERNATIONAL EXCHANGE
  // ==========================================================================
  const renderInternational = () => {
    const internationalItems = [
      {
        category: "交流动态",
        date: "2024-06-15",
        title: "中国古生物学会代表团赴瑞士参加国际古生物学术研讨会",
        desc: "应国际古生物学协会邀请，我会代表团近日赴瑞士苏黎世大学进行学术访问，并就全球气候变化背景下的化石记录研究达成多项合作协议。",
        icon: "public"
      },
      {
        category: "国际会议",
        date: "2024-05-20",
        title: "第十五届国际古生物学大会在北京召开",
        desc: "本次大会汇聚了来自全球60多个国家和地区的古生物学家，共同探讨地球生命演化的前沿问题，发布了多项重要学术成果。",
        icon: "groups"
      },
      {
        category: "合作机构",
        date: "2024-04-10",
        title: "与美国古生物学会签署学术交流合作协议",
        desc: "两会将在学生交流、联合研究、学术出版等方面开展深度合作，共同推进全球古生物学事业发展。",
        icon: "handshake"
      }
    ];

    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-6">
              <div className="bg-white border border-[#E5E1DA] rounded-lg overflow-hidden shadow-sm">
                <div className="bg-[#002B49] text-white px-6 py-4 font-bold">栏目导航</div>
                <nav className="flex flex-col">
                  <a className="px-6 py-3 border-b border-[#E5E1DA] hover:bg-slate-50 transition-colors flex items-center justify-between group" href="#">
                    <span className="text-sm">交流动态</span>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                  </a>
                  <a className="px-6 py-3 border-b border-[#E5E1DA] hover:bg-slate-50 transition-colors flex items-center justify-between group" href="#">
                    <span className="text-sm">国际会议</span>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                  </a>
                  <a className="px-6 py-3 border-b border-[#E5E1DA] hover:bg-slate-50 transition-colors flex items-center justify-between group" href="#">
                    <span className="text-sm">国际会议组织</span>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                  </a>
                  <a className="px-6 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group" href="#">
                    <span className="text-sm">合作机构</span>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#002B49] text-xs">arrow_forward_ios</span>
                  </a>
                </nav>
              </div>
              <div className="p-6 bg-slate-50 border-l-4 border-[#002B49] rounded-lg">
                <h4 className="font-bold text-[#002B49] mb-3 text-sm">联系国际合作处</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">如有国际会议、学术访问或合作咨询，欢迎联系我们。</p>
                <a className="text-[#002B49] font-bold text-xs flex items-center gap-2 hover:underline" href="mailto:intl@chinapsc.cn">
                  <span className="material-symbols-outlined text-base">mail</span> intl@chinapsc.cn
                </a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="mb-8 flex justify-between items-center border-b-2 border-[#002B49] pb-4">
              <h2 className="text-2xl font-bold text-[#002B49]">国际交流动态</h2>
            </div>
            <div className="space-y-0 divide-y divide-[#E5E1DA] border-t border-[#E5E1DA]">
              {internationalItems.map((item, idx) => (
                <article key={idx} className="py-6 flex gap-6 items-start hover:bg-slate-50 transition-all duration-200 group px-2">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#002B49] rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 font-bold text-[10px] rounded-sm bg-[#f5e0ba] text-[#241a03]">{item.category}</span>
                      <time className="text-xs text-slate-500 font-medium">{item.date}</time>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-slate-800 group-hover:text-[#002B49] transition-colors cursor-pointer leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-4">
                      <a className="text-[#002B49] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all" href="#">
                        查看全文 <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Global Partners */}
        <section className="bg-[#002B49] py-12 rounded-lg mt-12">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-8">全球学术伙伴</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70 hover:opacity-100 transition-opacity items-center justify-items-center max-w-4xl mx-auto">
              <div className="text-lg font-bold border border-white/20 px-6 py-3 rounded w-32">IPA</div>
              <div className="text-lg font-bold border border-white/20 px-6 py-3 rounded w-32">UNESCO</div>
              <div className="text-lg font-bold border border-white/20 px-6 py-3 rounded w-32">IUGS</div>
              <div className="text-lg font-bold border border-white/20 px-6 py-3 rounded w-32">PALASS</div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ==========================================================================
  // RENDER: SCIENCE & TECHNOLOGY AWARDS
  // ==========================================================================
  const renderAwards = () => {
    const awards = [
      {
        name: "杰出成就奖",
        desc: "表彰在古生物学研究、教育或传播中做出杰出贡献的科学家",
        icon: "star",
        color: "bg-yellow-50 border-yellow-200"
      },
      {
        name: "青年古生物学奖",
        desc: "鼓励45岁以下的青年学者在古生物学领域的创新研究",
        icon: "trending_up",
        color: "bg-blue-50 border-blue-200"
      },
      {
        name: "优秀论文奖",
        desc: "表彰在学会年会或期刊上发表的优秀学术论文",
        icon: "description",
        color: "bg-green-50 border-green-200"
      },
      {
        name: "科普传播奖",
        desc: "表彰在科学传播和公众教育中做出突出贡献的个人和团队",
        icon: "campaign",
        color: "bg-purple-50 border-purple-200"
      }
    ];

    const winners = [
      { year: 2023, count: 12, awardName: "杰出成就奖" },
      { year: 2023, count: 8, awardName: "青年古生物学奖" },
      { year: 2022, count: 15, awardName: "优秀论文奖" }
    ];

    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Award Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#002B49] mb-8 border-b-2 border-[#002B49] pb-4">奖项体系</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, idx) => (
              <div key={idx} className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${award.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-3xl text-[#002B49]">{award.icon}</span>
                  <h3 className="font-bold text-[#002B49] text-lg">{award.name}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{award.desc}</p>
                <button className="mt-4 w-full py-2 bg-[#002B49] text-white font-bold text-xs rounded hover:bg-[#001f35] transition-colors">
                  了解详情
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Application Guidelines */}
        <div className="bg-white border border-[#E5E1DA] rounded-lg p-8 mb-12 shadow-sm">
          <h3 className="text-xl font-bold text-[#002B49] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span> 申报指南
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#002B49]">
              <h4 className="font-bold text-[#002B49] mb-2 text-sm">申报时间</h4>
              <p className="text-xs text-slate-600">每年3月-5月为申报期，具体时间另行通知。</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#715a3e]">
              <h4 className="font-bold text-[#715a3e] mb-2 text-sm">申报方式</h4>
              <p className="text-xs text-slate-600">通过学会官网在线申报系统或邮件提交申报材料。</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#f5e0ba]">
              <h4 className="font-bold text-[#241a03] mb-2 text-sm">评审流程</h4>
              <p className="text-xs text-slate-600">初审 → 专家评审 → 学会审议 → 公示 → 颁奖。</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button className="px-6 py-2 bg-[#002B49] text-white font-bold text-xs rounded hover:bg-[#001f35] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">download</span> 下载申报表
            </button>
            <button className="px-6 py-2 border-2 border-[#002B49] text-[#002B49] font-bold text-xs rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">open_in_new</span> 在线申报
            </button>
          </div>
        </div>

        {/* Past Winners */}
        <div>
          <h3 className="text-xl font-bold text-[#002B49] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">history</span> 历届获奖者
          </h3>
          <div className="space-y-4">
            {winners.map((winner, idx) => (
              <div key={idx} className="bg-white border border-[#E5E1DA] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#002B49] text-lg">{winner.awardName}</h4>
                    <p className="text-sm text-slate-500 mt-1">{winner.year}年度</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#002B49]">{winner.count}</div>
                    <p className="text-xs text-slate-500">位获奖者</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER: PROFESSIONAL BRANCHES (专业分会)
  // ==========================================================================
  const renderBranches = () => {
    const branchesData = [
      { id: "gwjz", name: "古无脊椎动物学分会", shortName: "古无脊椎", icon: "pest_control", color: "#002B49", founded: "2016年12月18日", location: "贵州贵阳", intro: "中国古生物学会古无脊椎动物学分会是中国古生物学会下的一个二级组织，2016年12月18日在贵州贵阳成立。成立古无脊椎动物学分会，是中国古生物学会发展历程中具有里程碑式的大事，不仅可以有效联合国内各单位相关专家，组织学术交流，而且利于这一重要学科领域的人才培养、强化科学普及活动，并积极促进本学科的发展，力争和保持在国际上的学科优势地位，为我国古生物学事业发展作出新贡献。", tags: ["无脊椎化石", "学术交流", "人才培养"] },
      { id: "kpgz", name: "科普工作委员会", shortName: "科普委", icon: "science", color: "#1a5276", founded: "不详", location: "南京", intro: "科普工作委员会是中国古生物学会最年轻的分支机构之一，自成立以来，在中国古生物学会的领导下，在各位委员大力支持下，委员会团结全国广大地质古生物科普工作者、特别是自然类博物馆及文创系统的同志们，开展了一系列卓有成效的科普工作，为扩大中国古生物学会在社会上影响，发挥地质古生物学科在科学传播和提高全民科学素质，动员和鼓励科研人员参与科普工作做出了积极努力和贡献。", tags: ["科学传播", "博物馆", "全民科普"] },
      { id: "bfxfh", name: "孢粉学分会", shortName: "孢粉学", icon: "local_florist", color: "#1e8449", founded: "1979年", location: "天津", intro: "1979年，约300名孢粉学家在天津举行会议，正式成立中国孢粉学会（PSC）。作为中国孢粉学的奠基人，徐仁教授当选为理事长。此后，孢粉学在中国得到了更加快速的发展，1988年在册会员已超过510名。现在仍有250多位孢粉工作者活跃在孢粉学各个研究领域。中国是国际孢粉学会联合会的发起国之一，2000年学会成功地在中国南京组织召开了第十届国际孢粉学大会，约300名代表出席了这次盛会。", tags: ["孢粉化石", "古生态", "生物地层"] },
      { id: "wtx", name: "微体学分会", shortName: "微体学", icon: "biotech", color: "#6c3483", founded: "1979年3月", location: "长沙", intro: "中国微体古生物学会成立大会及第一次学术会议于1979年3月21日至27日在长沙召开。微体学分会自成立以来，在推动我国微体古生物学学术交流及学科发展、服务我国矿产能源勘探开发等方面做出了重要贡献。", tags: ["微体化石", "有孔虫", "能源勘探"] },
      { id: "hszl", name: "化石藻类专业委员会", shortName: "化石藻类", icon: "grass", color: "#117a65", founded: "1981年12月", location: "南京", intro: "中国古生物学会化石藻类专业委员会成立于1981年12月，发起人为朱浩然、邢裕盛、曹瑞骥、刘志礼。是中国古生物学会的组成部分，是我国化石藻类专业科学技术工作组跨行业、跨部门自愿结合依法登记成立，具有公益性和科学性的非营利性的社会学术团体。", tags: ["藻类化石", "跨行业合作", "公益学术"] },
      { id: "gzwxfh", name: "古植物学分会", shortName: "古植物", icon: "park", color: "#1d6a27", founded: "1983年", location: "西安", intro: "中国古生物学会古植物学分会自1983年于西安成立以来，不断发展壮大，来自中国的古植物学者们在古植物系统演化、古气候与古环境变化、碳循环与大气二氧化碳浓度变化等领域做出了卓越贡献，在早期陆生植物演化、银杏类演化、被子植物起源与演化等领域建树颇丰，跻身世界前列。", tags: ["古植物演化", "古气候", "被子植物起源"] },
      { id: "dqswx", name: "地球生物学分会", shortName: "地球生物", icon: "public", color: "#1a5276", founded: "2018年9月18日", location: "南京", intro: "中国古生物学会地球生物学分会成立于2018年9月18日，发起人为谢树成等，是中国古生物学会重要组成部分，具有公益性和科学性的非营利性的社会学术团体。地球生物学分会旨在团结地球生物学科技工作者，推动国内地球生物学的发展与提升学科领域整体研究水平。", tags: ["地球生物学", "学科交叉", "研究水平"] },
      { id: "gst", name: "古生态专业分会", shortName: "古生态", icon: "eco", color: "#196f3d", founded: "1988年10月", location: "山东临朐", intro: "1988年10月29日至11月2日，中国古生物学会古生态专业委员会第一届学术年会在山东临朐召开，并选举杨式溥为中国古生物学会古生态专业委员会主任。古生态专业委员会旨在团结、组织全国古生态学工作者，发扬学术民主，贯彻百花齐放的方针，坚持实事求是的科学态度和优良学风，面向现代化，面向世界，面向未来。", tags: ["古生态", "学术民主", "生物环境"] },
      { id: "gjzdw", name: "古脊椎动物学分会", shortName: "古脊椎", icon: "cruelty_free", color: "#784212", founded: "1984年10月17日", location: "山东莱阳", intro: "中国古脊椎动物学会是中国古生物学会下的一个二级组织，1984年10月17日在山东莱阳成立。本会定名为古脊椎动物学会，是中国古生物学会的二级学会，是我国古脊椎动物学界群众性的学术团体。宗旨是团结全国古脊椎动物学工作者积极开展学术交流，提高古脊椎动物学研究的科学水平，为推动我国古脊椎动物学事业的发展，为本门学科领域出成果、出人才作出贡献。", tags: ["脊椎动物", "恐龙", "哺乳动物"] },
      { id: "swcj", name: "生物沉积学分会", shortName: "生物沉积", icon: "layers", color: "#5d6d7e", founded: "2024年10月26日", location: "中国地质大学（武汉）", intro: "中国古生物学会生物沉积学分会是中国古生物学会下的一个二级组织。2024年10月26日，中国古生物学会生物沉积学分会成立大会在中国地质大学（武汉）未来城校区召开。生物沉积学是一门现代生物学、古生物学、沉积学和地球化学高度交叉的学科分支，旨在揭示生物参与发生在地球上各种沉积过程和化学循环的机制。", tags: ["生物沉积", "地球化学", "学科交叉"] },
      { id: "xjsxff", name: "新技术新方法专业委员会", shortName: "新技术", icon: "precision_manufacturing", color: "#1b2631", founded: "2024年12月7日", location: "中国地质大学（武汉）", intro: "专委会旨在搭建古生物新技术新方法的交流、合作平台，推动古生物学研究与新技术、新方法的深度融合，进而解决古生物学中的难题，提升我国古生物学研究的国际竞争力。中国古生物学会新技术新方法专业委员会于2024年12月7日在中国地质大学（武汉）召开第一届会员代表大会暨第一届一次学术年会。", tags: ["新技术", "数字化", "国际竞争力"] },
    ];

    const selectedId = selectedBranchId;
    const setSelectedId = setSelectedBranchId;
    const selected = branchesData.find(b => b.id === selectedId);

    if (selectedId && selected) {
      return (
        <div className="max-w-7xl mx-auto py-10 px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <button onClick={() => setSelectedId(null)} className="hover:text-[#002B49] transition-colors flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>专业分会列表
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#002B49] font-bold">{selected.name}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-[#E5E1DA] rounded-xl overflow-hidden shadow-sm">
                <div className="h-2" style={{ backgroundColor: selected.color }} />
                <div className="p-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: selected.color + "15" }}>
                    <span className="material-symbols-outlined text-[28px]" style={{ color: selected.color }}>{selected.icon}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#002B49] mb-1" style={{ fontFamily: "Georgia, serif" }}>{selected.name}</h2>
                  <p className="text-xs text-slate-400 mb-5">中国古生物学会下属专业分会</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">event</span>
                      <div><p className="text-slate-400 font-bold mb-0.5">成立时间</p><p className="font-bold text-slate-700">{selected.founded}</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">location_on</span>
                      <div><p className="text-slate-400 font-bold mb-0.5">成立地点</p><p className="font-bold text-slate-700">{selected.location}</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">account_balance</span>
                      <div><p className="text-slate-400 font-bold mb-0.5">上级单位</p><p className="font-bold text-slate-700">中国古生物学会</p></div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">研究方向</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: selected.color + "12", color: selected.color }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E5E1DA] rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">其他分会</p>
                <div className="space-y-1">
                  {branchesData.filter(b => b.id !== selected.id).slice(0, 6).map(b => (
                    <button key={b.id} onClick={() => setSelectedId(b.id)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#002B49] hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]" style={{ color: b.color }}>{b.icon}</span>{b.name}
                    </button>
                  ))}
                  {branchesData.filter(b => b.id !== selected.id).length > 6 && (
                    <button onClick={() => setSelectedId(null)} className="w-full text-left px-3 py-2 text-xs font-bold text-[#715a3e] hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">expand_more</span>查看全部分会
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <span className="material-symbols-outlined text-[#715a3e]">info</span>
                  <h3 className="text-lg font-bold text-[#002B49]" style={{ fontFamily: "Georgia, serif" }}>分会简介</h3>
                </div>
                <p className="text-sm text-slate-700 leading-8 tracking-wide">{selected.intro}</p>
              </div>
              <div className="bg-[#f5f8fb] border border-[#002B49]/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#002B49]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#002B49] text-[20px]">link</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#002B49] text-sm mb-1">了解更多</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">如需了解该分会的最新动态、会议通知及学术资源，请访问中国古生物学会官方网站或联系学会秘书处。</p>
                    <a href="http://www.chinapsc.cn/zyfh/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B49] hover:text-[#715a3e] transition-colors">
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>访问中国古生物学会官网专业分会页面
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-[#002B49] text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>全部专业分会
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {branchesData.map(b => (
                    <button key={b.id} onClick={() => setSelectedId(b.id)} className={`text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${ b.id === selected.id ? "border-[#002B49] bg-[#002B49] text-white" : "border-[#E5E1DA] text-slate-600 hover:border-[#002B49]/30 hover:bg-slate-50" }`}>
                      {b.shortName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#002B49] mb-2" style={{ fontFamily: "Georgia, serif" }}>专业分会</h2>
          <p className="text-slate-500 text-xs">中国古生物学会下设11个专业分会（委员会），点击任意分会卡片查看详细介绍。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchesData.map((branch, idx) => (
            <div key={branch.id} onClick={() => setSelectedId(branch.id)} className="bg-white border border-[#E5E1DA] rounded-xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: branch.color }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: branch.color + "15" }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: branch.color }}>{branch.icon}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: branch.color + "12", color: branch.color }}>{String(idx + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-bold text-[#002B49] text-base mb-1 group-hover:text-[#715a3e] transition-colors">{branch.name}</h3>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-3">{branch.intro}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {branch.tags.map(tag => (<span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{tag}</span>))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">成立：{branch.founded}</span>
                <span className="flex items-center text-xs font-bold gap-1 transition-colors" style={{ color: branch.color }}>查看详情<span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PartyLayout currentPageTitle="学会服务" breadcrumbs={[{ title: "学会服务", href: "/services" }]}>
      <div className="flex flex-col">
        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-[#E5E1DA] sticky top-[60px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2">
            <button onClick={() => { setActiveTab("main"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "main" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">home</span> 服务大厅
            </button>
            <button onClick={() => { setActiveTab("branches"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "branches" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">account_tree</span> 专业分会
            </button>
            <button onClick={() => { setActiveTab("member"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "member" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">card_membership</span> 会员服务
            </button>
            <button onClick={() => { setActiveTab("conference"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "conference" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">event</span> 学术会议
            </button>
            <button onClick={() => { setActiveTab("international"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "international" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">public</span> 国际交流
            </button>
            <button onClick={() => { setActiveTab("science"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "science" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">campaign</span> 科学传播
            </button>
            <button onClick={() => { setActiveTab("awards"); setShowFeePayment(null); setSelectedConference(null); setEditingReg(null); }} className={`px-4 py-3 font-bold text-xs transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${activeTab === "awards" ? "border-[#002B49] text-[#002B49]" : "border-transparent text-slate-500 hover:text-[#002B49]"}`}>
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span> 科技奖励
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-[#FCFAF7] min-h-[60vh]">
          {activeTab === "main" && renderMainPortal()}
          {activeTab === "branches" && renderBranches()}
          {activeTab === "member" && renderMemberServices()}
          {activeTab === "conference" && renderConferenceList()}
          {activeTab === "science" && renderScienceComm()}
          {activeTab === "international" && renderInternational()}
          {activeTab === "awards" && renderAwards()}
        </div>
      </div>
      <LoginJoinDialog open={dialogOpen} onOpenChange={setDialogOpen} initialTab={dialogTab} />
    </PartyLayout>
  );
}
