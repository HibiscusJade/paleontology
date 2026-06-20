import { useState } from "react";
import PartyLayout from "../components/PartyLayout";

// 11 专业分会数据
const branchesData = [
  {
    id: "gwjz",
    name: "古无脊椎动物学分会",
    shortName: "古无脊椎",
    icon: "pest_control",
    color: "#002B49",
    founded: "2016年12月18日",
    location: "贵州贵阳",
    intro: `中国古生物学会古无脊椎动物学分会是中国古生物学会下的一个二级组织，2016年12月18日在贵州贵阳成立。成立古无脊椎动物学分会，是中国古生物学会发展历程中具有里程碑式的大事，不仅可以有效联合国内各单位相关专家，组织学术交流，而且利于这一重要学科领域的人才培养、强化科学普及活动，并积极促进本学科的发展，力争和保持在国际上的学科优势地位，为我国古生物学事业发展作出新贡献。`,
    tags: ["无脊椎化石", "学术交流", "人才培养"],
  },
  {
    id: "kpgz",
    name: "科普工作委员会",
    shortName: "科普委",
    icon: "science",
    color: "#1a5276",
    founded: "不详",
    location: "南京",
    intro: `科普工作委员会是中国古生物学会最年轻的分支机构之一，自成立以来，在中国古生物学会的领导下，在各位委员大力支持下，委员会团结全国广大地质古生物科普工作者、特别是自然类博物馆及文创系统的同志们，开展了一系列卓有成效的科普工作，为扩大中国古生物学会在社会上影响，发挥地质古生物学科在科学传播和提高全民科学素质，动员和鼓励科研人员参与科普工作做出了积极努力和贡献。`,
    tags: ["科学传播", "博物馆", "全民科普"],
  },
  {
    id: "bfxfh",
    name: "孢粉学分会",
    shortName: "孢粉学",
    icon: "local_florist",
    color: "#1e8449",
    founded: "1979年",
    location: "天津",
    intro: `1979年，约300名孢粉学家在天津举行会议，正式成立中国孢粉学会（PSC）。作为中国孢粉学的奠基人，徐仁教授当选为理事长。此后，孢粉学在中国得到了更加快速的发展，1988年在册会员已超过510名。现在仍有250多位孢粉工作者活跃在孢粉学各个研究领域。中国是国际孢粉学会联合会的发起国之一，2000年学会成功地在中国南京组织召开了第十届国际孢粉学大会，约300名代表出席了这次盛会。`,
    tags: ["孢粉化石", "古生态", "生物地层"],
  },
  {
    id: "wtx",
    name: "微体学分会",
    shortName: "微体学",
    icon: "biotech",
    color: "#6c3483",
    founded: "1979年3月",
    location: "长沙",
    intro: `中国微体古生物学会成立大会及第一次学术会议于1979年3月21日至27日在长沙召开。微体学分会自成立以来，在推动我国微体古生物学学术交流及学科发展、服务我国矿产能源勘探开发等方面做出了重要贡献。`,
    tags: ["微体化石", "有孔虫", "能源勘探"],
  },
  {
    id: "hszl",
    name: "化石藻类专业委员会",
    shortName: "化石藻类",
    icon: "grass",
    color: "#117a65",
    founded: "1981年12月",
    location: "南京",
    intro: `中国古生物学会化石藻类专业委员会成立于1981年12月，发起人为朱浩然、邢裕盛、曹瑞骥、刘志礼。是中国古生物学会的组成部分，是我国化石藻类专业科学技术工作组跨行业、跨部门自愿结合依法登记成立，具有公益性和科学性的非营利性的社会学术团体。`,
    tags: ["藻类化石", "跨行业合作", "公益学术"],
  },
  {
    id: "gzwxfh",
    name: "古植物学分会",
    shortName: "古植物",
    icon: "park",
    color: "#1d6a27",
    founded: "1983年",
    location: "西安",
    intro: `中国古生物学会古植物学分会自1983年于西安成立以来，不断发展壮大，来自中国的古植物学者们在古植物系统演化、古气候与古环境变化、碳循环与大气二氧化碳浓度变化等领域做出了卓越贡献，在早期陆生植物演化、银杏类演化、被子植物起源与演化等领域建树颇丰，跻身世界前列。`,
    tags: ["古植物演化", "古气候", "被子植物起源"],
  },
  {
    id: "dqswx",
    name: "地球生物学分会",
    shortName: "地球生物",
    icon: "public",
    color: "#1a5276",
    founded: "2018年9月18日",
    location: "南京",
    intro: `中国古生物学会地球生物学分会成立于2018年9月18日，发起人为谢树成等，是中国古生物学会重要组成部分，具有公益性和科学性的非营利性的社会学术团体。地球生物学分会旨在团结地球生物学科技工作者，推动国内地球生物学的发展与提升学科领域整体研究水平。`,
    tags: ["地球生物学", "学科交叉", "研究水平"],
  },
  {
    id: "gst",
    name: "古生态专业分会",
    shortName: "古生态",
    icon: "eco",
    color: "#196f3d",
    founded: "1988年10月",
    location: "山东临朐",
    intro: `1988年10月29日至11月2日，中国古生物学会古生态专业委员会第一届学术年会在山东临朐召开，并选举杨式溥为中国古生物学会古生态专业委员会主任。古生态专业委员会旨在团结、组织全国古生态学工作者，发扬学术民主，贯彻百花齐放的方针，坚持实事求是的科学态度和优良学风，面向现代化，面向世界，面向未来。`,
    tags: ["古生态", "学术民主", "生物环境"],
  },
  {
    id: "gjzdw",
    name: "古脊椎动物学分会",
    shortName: "古脊椎",
    icon: "cruelty_free",
    color: "#784212",
    founded: "1984年10月17日",
    location: "山东莱阳",
    intro: `中国古脊椎动物学会是中国古生物学会下的一个二级组织，1984年10月17日在山东莱阳成立。本会定名为"古脊椎动物学会"，是中国古生物学会的二级学会，是我国古脊椎动物学界群众性的学术团体。宗旨是团结全国古脊椎动物学工作者积极开展学术交流，提高古脊椎动物学研究的科学水平，为推动我国古脊椎动物学事业的发展，为本门学科领域出成果、出人才作出贡献。`,
    tags: ["脊椎动物", "恐龙", "哺乳动物"],
  },
  {
    id: "swcj",
    name: "生物沉积学分会",
    shortName: "生物沉积",
    icon: "layers",
    color: "#5d6d7e",
    founded: "2024年10月26日",
    location: "中国地质大学（武汉）",
    intro: `中国古生物学会生物沉积学分会是中国古生物学会下的一个二级组织。2024年10月26日，中国古生物学会生物沉积学分会成立大会在中国地质大学（武汉）未来城校区召开。生物沉积学是一门现代生物学、古生物学、沉积学和地球化学高度交叉的学科分支，旨在揭示生物参与发生在地球上各种沉积过程和化学循环的机制。`,
    tags: ["生物沉积", "地球化学", "学科交叉"],
  },
  {
    id: "xjsxff",
    name: "新技术新方法专业委员会",
    shortName: "新技术",
    icon: "precision_manufacturing",
    color: "#1b2631",
    founded: "2024年12月7日",
    location: "中国地质大学（武汉）",
    intro: `专委会旨在搭建古生物新技术新方法的交流、合作平台，推动古生物学研究与新技术、新方法的深度融合，进而解决古生物学中的难题，提升我国古生物学研究的国际竞争力。中国古生物学会新技术新方法专业委员会于2024年12月7日在中国地质大学（武汉）召开第一届会员代表大会暨第一届一次学术年会。`,
    tags: ["新技术", "数字化", "国际竞争力"],
  },
];

export default function Branches() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const selected = branchesData.find((b) => b.id === selectedBranch);

  return (
    <PartyLayout
      currentPageTitle="专业分会"
      breadcrumbs={[{ title: "专业分会", href: "/branches" }]}
    >
      <div className="bg-[#FCFAF7] min-h-screen">
        {/* Hero Banner */}
        <section className="bg-white border-b border-[#E5E1DA] py-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <span className="font-bold text-xs tracking-widest text-[#715a3e] block mb-3 uppercase">
              PROFESSIONAL BRANCHES
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#002B49] mb-4 leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              专业分会
            </h1>
            <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
              中国古生物学会下设11个专业分会（委员会），覆盖古无脊椎动物、古脊椎动物、古植物、孢粉、微体、地球生物学等主要研究领域，团结全国古生物学科技工作者，推动学科发展与国际交流。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-[#D9C5A0]/20 border border-[#D9C5A0]/40 rounded-full px-4 py-1.5">
                <span className="material-symbols-outlined text-[#715a3e] text-[16px]">account_balance</span>
                <span className="text-xs font-bold text-[#715a3e]">1 个总学会</span>
              </div>
              <div className="flex items-center gap-2 bg-[#002B49]/5 border border-[#002B49]/10 rounded-full px-4 py-1.5">
                <span className="material-symbols-outlined text-[#002B49] text-[16px]">groups</span>
                <span className="text-xs font-bold text-[#002B49]">11 个专业分会</span>
              </div>
              <div className="flex items-center gap-2 bg-[#715a3e]/5 border border-[#715a3e]/10 rounded-full px-4 py-1.5">
                <span className="material-symbols-outlined text-[#715a3e] text-[16px]">history_edu</span>
                <span className="text-xs font-bold text-[#715a3e]">最早成立于 1979 年</span>
              </div>
              <div className="flex items-center gap-2 bg-green-600/5 border border-green-600/10 rounded-full px-4 py-1.5">
                <span className="material-symbols-outlined text-green-700 text-[16px]">new_releases</span>
                <span className="text-xs font-bold text-green-700">最新成立于 2024 年</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {!selectedBranch ? (
            /* Branch Grid */
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2
                    className="text-2xl font-bold text-[#002B49]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    学会组织架构
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    总学会 + 11个专业分会（委员会），点击任意卡片查看详细介绍
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Phase 2: 总学会卡片 — 金色边框置顶 */}
                <div className="bg-white border-2 border-[#D9C5A0] rounded-xl p-6 shadow-md relative overflow-hidden sm:col-span-2 lg:col-span-3">
                  {/* Golden accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9C5A0] via-[#c8a96e] to-[#D9C5A0]" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9C5A0] opacity-5 rounded-full translate-x-8 -translate-y-8" />
                  <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                    {/* Badge */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#D9C5A0] to-[#c8a96e] flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[32px] text-white">account_balance</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-[#002B49] text-lg" style={{ fontFamily: "Georgia, serif" }}>中国古生物学会（总学会）</h3>
                        <span className="text-[10px] font-bold bg-[#D9C5A0]/20 text-[#715a3e] px-2.5 py-0.5 rounded-full">上级单位</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-3xl">
                        中国古生物学会是由全国古生物科技工作者自愿组成的学术性、非营利性社会团体，是中国科学技术协会的组成部分。学会成立于1979年，致力于推动古生物学领域的学术交流、科学普及与学科发展，组织全国性及国际性学术会议，促进古生物学科研成果的传播与应用。
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {["学术交流", "科学普及", "学科发展", "国际会议", "人才培养"].map(tag => (
                          <span key={tag} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D9C5A0]/10 text-[#715a3e] border border-[#D9C5A0]/30">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#715a3e]">event</span>成立于 1979 年</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#715a3e]">location_on</span>江苏 · 南京</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#715a3e]">group</span>11 个下属分会</span>
                        </div>
                        <a
                          href="http://www.chinapsc.cn/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-[#715a3e] hover:text-[#002B49] transition-colors border border-[#D9C5A0] px-3 py-1.5 rounded-lg hover:bg-[#D9C5A0]/10"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>访问总学会官网
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {branchesData.map((branch, idx) => (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className="bg-white border border-[#E5E1DA] rounded-xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                      style={{ backgroundColor: branch.color }}
                    />

                    {/* Index badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: branch.color + "15" }}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ color: branch.color }}
                        >
                          {branch.icon}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: branch.color + "12",
                          color: branch.color,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#002B49] text-base mb-1 group-hover:text-[#715a3e] transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-3">
                      {branch.intro}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {branch.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        成立：{branch.founded}
                      </span>
                      <span
                        className="flex items-center text-xs font-bold gap-1 transition-colors"
                        style={{ color: branch.color }}
                      >
                        查看详情
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Branch Detail View */
            <div>
              {/* Breadcrumb back */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="hover:text-[#002B49] transition-colors flex items-center gap-1 font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  专业分会列表
                </button>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#002B49] font-bold">{selected?.name}</span>
              </div>

              {selected && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Info Card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#E5E1DA] rounded-xl overflow-hidden shadow-sm">
                      <div
                        className="h-2"
                        style={{ backgroundColor: selected.color }}
                      />
                      <div className="p-6">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: selected.color + "15" }}
                        >
                          <span
                            className="material-symbols-outlined text-[32px]"
                            style={{ color: selected.color }}
                          >
                            {selected.icon}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-[#002B49] mb-1" style={{ fontFamily: "Georgia, serif" }}>
                          {selected.name}
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">
                          中国古生物学会下属专业分会
                        </p>

                        <div className="space-y-3 text-xs">
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">event</span>
                            <div>
                              <p className="text-slate-400 font-bold mb-0.5">成立时间</p>
                              <p className="font-bold text-slate-700">{selected.founded}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">location_on</span>
                            <div>
                              <p className="text-slate-400 font-bold mb-0.5">成立地点</p>
                              <p className="font-bold text-slate-700">{selected.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="material-symbols-outlined text-[16px] text-[#715a3e] mt-0.5">account_balance</span>
                            <div>
                              <p className="text-slate-400 font-bold mb-0.5">上级单位</p>
                              <p className="font-bold text-slate-700">中国古生物学会</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="mt-5">
                          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">研究方向</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                style={{
                                  backgroundColor: selected.color + "12",
                                  color: selected.color,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation between branches */}
                    <div className="bg-white border border-[#E5E1DA] rounded-xl p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">学会组织</p>
                      <div className="space-y-1">
                        {/* Phase 2: 总学会入口 */}
                        <button
                          onClick={() => setSelectedBranch(null)}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-[#715a3e] hover:bg-[#D9C5A0]/10 rounded-lg transition-all flex items-center gap-2 border border-[#D9C5A0]/50 bg-[#D9C5A0]/5"
                        >
                          <span className="material-symbols-outlined text-[14px] text-[#715a3e]">account_balance</span>
                          中国古生物学会（总学会）
                        </button>
                        {branchesData
                          .filter((b) => b.id !== selected.id)
                          .slice(0, 5)
                          .map((b) => (
                            <button
                              key={b.id}
                              onClick={() => setSelectedBranch(b.id)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#002B49] hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
                            >
                              <span
                                className="material-symbols-outlined text-[14px]"
                                style={{ color: b.color }}
                              >
                                {b.icon}
                              </span>
                              {b.name}
                            </button>
                          ))}
                        {branchesData.filter((b) => b.id !== selected.id).length > 6 && (
                          <button
                            onClick={() => setSelectedBranch(null)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-[#715a3e] hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            查看全部分会
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Intro Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E5E1DA] rounded-xl p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <span className="material-symbols-outlined text-[#715a3e]">info</span>
                        <h3 className="text-lg font-bold text-[#002B49]" style={{ fontFamily: "Georgia, serif" }}>
                          分会简介
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-8 tracking-wide">
                        {selected.intro}
                      </p>
                    </div>

                    {/* Contact / External Link placeholder */}
                    <div className="bg-[#002B49]/3 border border-[#002B49]/10 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#002B49]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#002B49] text-[20px]">link</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#002B49] text-sm mb-1">了解更多</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">
                            如需了解该分会的最新动态、会议通知及学术资源，请访问中国古生物学会官方网站或联系学会秘书处。
                          </p>
                          <a
                            href="http://www.chinapsc.cn/zyfh/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B49] hover:text-[#715a3e] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            访问中国古生物学会官网专业分会页面
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* All branches quick nav */}
                    <div className="bg-white border border-[#E5E1DA] rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-[#002B49] text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                        全部学会组织
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {/* Phase 2: 总学会快捷入口 */}
                        <button
                          onClick={() => setSelectedBranch(null)}
                          className="text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border border-[#D9C5A0] bg-[#D9C5A0]/10 text-[#715a3e] hover:bg-[#D9C5A0]/20"
                        >
                          总学会
                        </button>
                        {branchesData.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBranch(b.id)}
                            className={`text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                              b.id === selected.id
                                ? "border-[#002B49] bg-[#002B49] text-white"
                                : "border-[#E5E1DA] text-slate-600 hover:border-[#002B49]/30 hover:bg-slate-50"
                            }`}
                          >
                            {b.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PartyLayout>
  );
}
