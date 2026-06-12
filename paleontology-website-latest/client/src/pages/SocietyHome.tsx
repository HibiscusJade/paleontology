import React from "react";
import { Link } from "wouter";
import PartyLayout from "../components/PartyLayout";

export default function SocietyHome() {
  return (
    <PartyLayout currentPageTitle="首页">
      <div className="flex flex-col w-full">
        {/* Full-Width Hero Section */}
        <section className="relative w-full h-[500px] flex items-center overflow-hidden mb-0">
          <div className="absolute inset-0 z-0">
            <img
              alt="中国古生物学会首页横幅"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNRleNYvnVjS703omdnq4SM-S4HAx1xJVPMOPltrMf3netfsxNQud338lNFjAxAV31Qvw_etAUmU7KMW1YX2RKxA0dIotwdignl1jKI4uZFvvhgyNMpO-uro4Ld7zpIKXe2gunUiSareQKqn3BzF2YiR1c6Mo4uJK52AGT3lz9FhR7rC91LMgbBgK9PpmNDIwMww8mYPVHIhMLQCaKNLMN8lTHz0YLT_5l_2At0BlIvczBqmME2kYLxSAm1wZ1q303vtfCEZnWQ4"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#002B49]/90 via-[#002B49]/40 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 text-white">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-block px-4 py-1 bg-[#f5e0ba]/20 border border-[#f5e0ba] text-[#f5e0ba] font-bold text-xs tracking-widest rounded-sm">
                ESTABLISHED 1929
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-widest xingkai-script text-[#f5e0ba]" style={{ textShadow: "rgba(0, 0, 0, 0.5) 2px 2px 4px" }}>
                中国古生物学会
              </h1>
              <p className="text-xl lg:text-2xl text-slate-200">探索生命的起源与演化</p>
              <p className="text-sm lg:text-base opacity-90 leading-relaxed">
                致力于古生物学及其相关学科的发展，推动科学研究与科普教育，连结全球学术智慧。
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/intro">
                  <button className="bg-[#003358] text-white px-6 py-3 rounded text-xs font-bold hover:bg-[#004a7c] transition-all flex items-center gap-2 cursor-pointer">
                    了解更多 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </Link>
                <Link href="/services">
                  <button className="border border-white text-white px-6 py-3 rounded text-xs font-bold hover:bg-white/10 transition-all cursor-pointer">
                    加入我们
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Full-Width Pure White Quick Services Grid */}
        <section className="w-full bg-white py-12 border-b border-[#E5E1DA] mb-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Link href="/intro" className="group flex flex-col items-center p-4 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#002b49] text-white group-hover:bg-[#004a7c] transition-colors shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance</span>
                </div>
                <span className="text-sm font-bold text-slate-800 mt-1">学会简介</span>
              </Link>
              <Link href="/structure" className="group flex flex-col items-center p-4 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#002b49] text-white group-hover:bg-[#004a7c] transition-colors shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>hub</span>
                </div>
                <span className="text-sm font-bold text-slate-800 mt-1">组织机构</span>
              </Link>
              <Link href="/services" className="group flex flex-col items-center p-4 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#002b49] text-white group-hover:bg-[#004a7c] transition-colors shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>handshake</span>
                </div>
                <span className="text-sm font-bold text-slate-800 mt-1">学会服务</span>
              </Link>
              <Link href="/party" className="group flex flex-col items-center p-4 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#002b49] text-white group-hover:bg-[#004a7c] transition-colors shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>flag</span>
                </div>
                <span className="text-sm font-bold text-slate-800 mt-1">党建文化</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Boxed News & Events Layout */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 w-full">
          <div className="grid grid-cols-12 gap-8 items-stretch">
            {/* Left: News & Dynamic Center */}
            <div className="col-span-12 lg:col-span-8 space-y-8 flex flex-col justify-between">
              {/* Featured News Slider */}
              <div className="relative w-full overflow-hidden rounded-lg shadow-sm border border-[#E5E1DA] group min-h-[350px] flex-grow">
                <img
                  alt="中国古生物学会天体生物学分会在南京成立"
                  className="w-full h-full object-cover absolute inset-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChZnLBVeHAiOhUffpt-k42OMSP1acoKVaF3_S1KcQKeIU9ajRgy1Biwa_GhbFtEtv3BIf3g3SS1UCngWdi7QQRF7WsxAgrOsw2piyH2v16Sm54ybLgj7z9fFIiG17FEShTbPhN1OMvZGMQbaLsdWz_cnv75r6TYAAY5JzDSqw-HmWW3Fgfe-aWHSPG6MeAeVBYUdQqVHsgo_KqtkjNf6S7vlUv8tUwJItYPeIsWCP_G-hdPIyoBkDMCFtc_gf-B5100oHhGAmC-hc"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h2 className="text-xl font-bold">中国古生物学会天体生物学分会在南京成立</h2>
                </div>
              </div>

              {/* Academic Trends & Progress Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Academic Trends */}
                <div className="bg-white border border-[#E5E1DA] border-t-2 border-t-[#D9C5A0] p-6 shadow-sm rounded hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-[#003358] flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500">science</span>
                      学术动态
                    </h3>
                    <Link href="/announcements" className="text-xs text-slate-500 hover:text-[#003358]">更多+</Link>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-4 group">
                      <div className="flex-none w-14 h-14 bg-slate-50 flex flex-col items-center justify-center rounded border border-[#E5E1DA]">
                        <span className="text-sm font-bold text-[#003358]">05-24</span>
                        <span className="text-[10px] text-slate-400 uppercase">2024</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer line-clamp-1">
                          关于征集2025年度古生物学重大发现的通知
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">重点征集具有重大科学意义和社会影响力的发现...</p>
                      </div>
                    </li>
                    <li className="flex gap-4 group border-t border-slate-100 pt-4">
                      <div className="flex-none w-14 h-14 bg-slate-50 flex flex-col items-center justify-center rounded border border-[#E5E1DA]">
                        <span className="text-sm font-bold text-[#003358]">05-20</span>
                        <span className="text-[10px] text-slate-400 uppercase">2024</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer line-clamp-1">
                          中外科学家联合揭示早白垩世鸟类演化新机理
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">该研究成果在《Nature》子刊在线发表...</p>
                      </div>
                    </li>
                    <li className="flex gap-4 group border-t border-slate-100 pt-4">
                      <div className="flex-none w-14 h-14 bg-slate-50 flex flex-col items-center justify-center rounded border border-[#E5E1DA]">
                        <span className="text-sm font-bold text-[#003358]">05-15</span>
                        <span className="text-[10px] text-slate-400 uppercase">2024</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer line-clamp-1">
                          古生物学会代表团出席国际地学大会纪要
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">加强国际交流，提升中国古生物学话语权...</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Work Progress */}
                <div className="bg-white border border-[#E5E1DA] border-t-2 border-t-[#D9C5A0] p-6 shadow-sm rounded hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-[#003358] flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500">work_history</span>
                      工作进展
                    </h3>
                    <Link href="/announcements" className="text-xs text-slate-500 hover:text-[#003358]">更多+</Link>
                  </div>
                  <ul className="space-y-4">
                    <li className="group">
                      <span className="text-[10px] text-slate-400 mb-1 block">2024-05-28</span>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer border-l-2 border-[#003358] pl-3">
                        学会秘书处召开年中总结研讨会
                      </h4>
                    </li>
                    <li className="group border-t border-slate-50 pt-3">
                      <span className="text-[10px] text-slate-400 mb-1 block">2024-05-22</span>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer border-l-2 border-[#003358] pl-3">
                        “古生物学进入校园”科普活动在京启动
                      </h4>
                    </li>
                    <li className="group border-t border-slate-50 pt-3">
                      <span className="text-[10px] text-slate-400 mb-1 block">2024-05-10</span>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer border-l-2 border-[#003358] pl-3">
                        关于开展会员会籍审查及数据更新的通知
                      </h4>
                    </li>
                    <li className="group border-t border-slate-50 pt-3">
                      <span className="text-[10px] text-slate-400 mb-1 block">2024-04-30</span>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#003358] transition-colors cursor-pointer border-l-2 border-[#003358] pl-3">
                        学会数字化建设工程第一阶段顺利完成
                      </h4>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Announcements & Resource Center */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col justify-between space-y-8 lg:space-y-0">
              {/* Announcements */}
              <div className="bg-slate-50 border border-[#E5E1DA] p-6 rounded">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#003358]" style={{ fontVariationSettings: '"FILL" 1' }}>campaign</span>
                  <h3 className="font-bold text-lg text-slate-800">通知公告</h3>
                </div>
                <div className="space-y-4">
                  <Link href="/society-announcements?highlight=2" className="block bg-white p-4 border-l-4 border-red-700 hover:bg-red-50 transition-colors rounded-r shadow-sm cursor-pointer">
                    <p className="text-xs text-red-700 font-bold mb-1">[置顶] 关于举办2024年全国学术年会...</p>
                    <span className="text-[10px] text-slate-400">2024-06-01</span>
                  </Link>
                  <Link href="/society-announcements?highlight=3" className="block hover:bg-white p-2 transition-colors border-b border-[#E5E1DA] cursor-pointer">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">学会近期人才库入库申请流程说明</p>
                    <span className="text-[10px] text-slate-400">2024-05-25</span>
                  </Link>
                  <Link href="/society-announcements?highlight=1" className="block hover:bg-white p-2 transition-colors border-b border-[#E5E1DA] cursor-pointer">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">第十五届古生物学优秀论文评选开始</p>
                    <span className="text-[10px] text-slate-400">2024-05-18</span>
                  </Link>
                  <Link href="/society-announcements?highlight=0" className="block hover:bg-white p-2 transition-colors border-b border-[#E5E1DA] cursor-pointer">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">关于更新会员缴费标准的公示</p>
                    <span className="text-[10px] text-slate-400">2024-05-05</span>
                  </Link>
                </div>
                <Link href="/society-announcements">
                  <button className="w-full mt-6 py-2 bg-white border border-slate-300 text-xs font-bold hover:bg-slate-100 transition-all rounded cursor-pointer">
                    查看全部公告
                  </button>
                </Link>
              </div>

              {/* Resource Center */}
              <div className="bg-white border border-[#E5E1DA] overflow-hidden rounded">
                <div className="p-4 bg-[#002B49] text-white">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined">library_books</span>
                    学术资源
                  </h3>
                </div>
                <div className="flex flex-col divide-y divide-[#E5E1DA]">
                  <Link href="/party" className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#003358]">account_balance</span>
                      <span className="text-xs font-bold text-slate-800">党建文化</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#003358] transition-colors">chevron_right</span>
                  </Link>
                  <Link href="/services?tab=branches" className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#003358]">account_tree</span>
                      <span className="text-xs font-bold text-slate-800">专业分会</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#003358] transition-colors">chevron_right</span>
                  </Link>
                  <Link href="/services" className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#003358]">card_membership</span>
                      <span className="text-xs font-bold text-slate-800">学会服务</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#003358] transition-colors">chevron_right</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PartyLayout>
  );
}
