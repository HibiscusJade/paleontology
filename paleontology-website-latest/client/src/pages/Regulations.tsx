import React, { useState } from "react";
import PartyLayout from "../components/PartyLayout";

export default function Regulations() {
  const [activeTab, setActiveTab] = useState("constitution");

  const handleScrollTo = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PartyLayout currentPageTitle="规章条例">
      <div className="grid grid-cols-12 gap-10">
        {/* Side Navigation */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white shadow-sm border border-[#E5E1DA] overflow-hidden rounded">
              <div className="bg-[#001d36] px-6 py-4">
                <h3 className="text-white font-bold text-lg">栏目导航</h3>
              </div>
              <ul className="divide-y divide-[#E5E1DA]">
                {[
                  { id: "constitution", name: "学会章程" },
                  { id: "protection-law", name: "保护条例" },
                  { id: "international", name: "国际准则" }
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleScrollTo(item.id)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-all group ${
                        activeTab === item.id
                          ? "bg-slate-100 border-l-4 border-[#001d36] font-bold text-[#001d36]"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="material-symbols-outlined text-[#001d36] group-hover:translate-x-1 transition-transform text-sm">
                        chevron_right
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-100 p-6 border-l-4 border-[#001d36] rounded">
              <h4 className="font-bold text-[#001d36] mb-2">资料索取</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                如需更多历史性法规文件或纸质版材料，请联系学会秘书处。
              </p>
              <a
                className="text-[#001d36] font-bold text-xs inline-flex items-center gap-1 hover:underline"
                href="mailto:contact@chinapsc.cn"
              >
                联系我们 <span className="material-symbols-outlined text-xs">mail</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <article className="col-span-12 lg:col-span-9">
          <div className="space-y-16">
            {/* Section: Constitution */}
            <section className="scroll-mt-32" id="constitution">
              <div className="flex items-end justify-between border-b-2 border-[#001d36] pb-4 mb-8">
                <h2 className="text-2xl font-bold text-[#001d36]">学会章程</h2>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest">SOCIETY CONSTITUTION</span>
              </div>
              <div className="bg-white border border-[#E5E1DA] p-8 hover:shadow-lg transition-shadow relative overflow-hidden group rounded">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 opacity-20 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-xl font-bold text-[#001d36] mb-4">中国古生物学会章程</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-sm">
                  本章程于2018年11月经第十二次全国会员代表大会表决通过。规定了学会是由中国古生物学工作者自愿组成的全国性、学术性、非营利性社会组织，是党和政府联系古生物学工作者的桥梁 and 纽带，是发展我国古生物学事业的重要社会力量。
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    className="bg-[#001d36] text-white px-6 py-3 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span> 在线浏览全文
                  </a>
                  <a
                    className="border border-[#001d36] text-[#001d36] px-6 py-3 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> 下载 PDF (1.2MB)
                  </a>
                </div>
              </div>
            </section>

            {/* Section: Protection Law */}
            <section className="scroll-mt-32" id="protection-law">
              <div className="flex items-end justify-between border-b-2 border-[#001d36] pb-4 mb-8">
                <h2 className="text-2xl font-bold text-[#001d36]">古生物化石保护条例</h2>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest">PROTECTION LAWS</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {/* Card 1 */}
                <div className="bg-white border border-[#E5E1DA] flex flex-col md:flex-row overflow-hidden hover:border-[#001d36] transition-colors rounded">
                  <div className="w-full md:w-1/3 bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#E5E1DA]">
                    <img
                      alt="Ammonite Fossil"
                      className="w-full h-40 object-cover shadow-md rounded"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2KyKhHxltTvpPeLLqB9R52vzMn8vDBGtOTP-tjc9WJkQSha6HLWQbwrQje7ZIv4-AB6ZXrRhqN5oQa7mmrsJi9SPd5Cl2Yk3UiTOdYi7_3KfHNUYTpZCMeNSWQkL2XGo4MdRQXnGC7Q4q5kluzTNica0bM7lCCsjJfXFzEOOo6dBpkktnNgSwQHP1W5ubb0orDC8RSDXVJg9g0CDwUWg99W-rCOL9KmQxgazk2OCI6WFscegrPiRBmwbK-Kvb9tOTcVTti7JORnfY"
                    />
                  </div>
                  <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="inline-block bg-[#241a04] text-[#f5e0ba] text-[10px] px-2 py-0.5 rounded-full mb-3 font-bold tracking-wider">
                        国务院令第580号
                      </div>
                      <h3 className="text-lg font-bold text-[#001d36] mb-3">古生物化石保护条例</h3>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                        为了加强对古生物化石的保护，促进古生物化石的科学研究与合理利用，根据有关法律，制定本条例。对化石发掘、收藏、出境、入境等活动进行了详细规范。
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#E5E1DA] flex items-center justify-between">
                      <span className="text-xs text-slate-400 italic">发布日期：2010年9月5日</span>
                      <div className="flex gap-4">
                        <a className="text-[#001d36] font-bold text-xs flex items-center gap-1 hover:underline" href="#">
                          详情 <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                        <a className="text-[#001d36] font-bold text-xs flex items-center gap-1 hover:underline" href="#">
                          PDF <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-[#E5E1DA] flex flex-col md:flex-row overflow-hidden hover:border-[#001d36] transition-colors rounded">
                  <div className="w-full md:w-1/3 bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#E5E1DA]">
                    <div className="w-full h-40 bg-slate-100 flex flex-col items-center justify-center border border-dashed border-[#001d36]/30 rounded">
                      <span className="material-symbols-outlined text-[#001d36] text-4xl mb-2">gavel</span>
                      <span className="text-[10px] font-bold text-[#001d36]/60">实施办法</span>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="inline-block bg-[#003358] text-[#a4caf7] text-[10px] px-2 py-0.5 rounded-full mb-3 font-bold tracking-wider">
                        国土资源部令第57号
                      </div>
                      <h3 className="text-lg font-bold text-[#001d36] mb-3">《古生物化石保护条例》实施办法</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        进一步明确了国家级古生物化石集中产地名录，细化了发掘申请、专家评审及化石档案管理等具体执行环节。
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#E5E1DA] flex items-center justify-between">
                      <span className="text-xs text-slate-400 italic">发布日期：2012年12月27日</span>
                      <div className="flex gap-4">
                        <a className="text-[#001d36] font-bold text-xs flex items-center gap-1 hover:underline" href="#">
                          详情 <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                        <a className="text-[#001d36] font-bold text-xs flex items-center gap-1 hover:underline" href="#">
                          PDF <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: International Guidelines */}
            <section className="scroll-mt-32" id="international">
              <div className="flex items-end justify-between border-b-2 border-[#001d36] pb-4 mb-8">
                <h2 className="text-2xl font-bold text-[#001d36]">国际准则</h2>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest">INTERNATIONAL STANDARDS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E1DA] p-6 rounded">
                  <h4 className="font-bold text-base text-slate-800 mb-2">国际动物命名法规 (ICZN)</h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    动物命名法的权威规则，旨在确保每一个动物分类单元都有一个且仅有一个唯一的科学名称。
                  </p>
                  <a className="text-[#001d36] text-xs font-bold flex items-center gap-1 hover:underline" href="#">
                    浏览国际官网 <span className="material-symbols-outlined text-xs">launch</span>
                  </a>
                </div>
                <div className="bg-white border border-[#E5E1DA] p-6 rounded">
                  <h4 className="font-bold text-base text-slate-800 mb-2">国际古生物学协会 (IPA) 章程</h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    指导全球古生物学机构合作、学术交流以及伦理研究的国际标准框架。
                  </p>
                  <a className="text-[#001d36] text-xs font-bold flex items-center gap-1 hover:underline" href="#">
                    浏览准则内容 <span className="material-symbols-outlined text-xs">launch</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>
    </PartyLayout>
  );
}
