import React, { useState } from "react";
import PartyLayout from "../components/PartyLayout";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("全部瞬间");

  const filters = ["全部瞬间", "早期风采", "学术会议", "野外考查", "国际交流"];

  const items = [
    {
      id: 1,
      type: "早期风采",
      year: "1929",
      title: "周口店第一地点挖掘现场",
      desc: "裴文中教授（左三）在发掘现场指导头盖骨提取工作。",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4CD47RJP1ogFmWRrSw0z7XDxVHIaSuvTO0NKbrARtNkWTTnGUkqAfgSr5Q20FLtavpmjnXkIsJNQgSrcuoxmZt8YU_frbWOjlEi_HMMV1es31QMxQ31X3-3CKxmN11KNvhLACKZQHVjvkW5BOJkt6fr52seSQJBEIfYYuD--b1h2jC7lSkPM4C7C1Ws6mVqnmb-gXfhJxhahv9VlQhyflvyvlltjW-ipgEaRyuZDMZbZt9ybu-yM85WRcOzP_tCL98JomX6QeKdjm",
      isWide: true,
    },
    {
      id: 2,
      type: "实验室研究",
      year: "1950s",
      title: "微体古生物观察",
      desc: "通过精密光学仪器探索微小生命演化证据。",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhi3QiW4l1uSrqDoOfkb5GQr_P_HyVl8yXH_MpZtsA5yI0gITcQ49GzyzlOrsqj0F8ngxOw_msu8epGjYt_qKELNeysYGl-kh061bR36y_fqt7mLAC1n5yuLoQ6DF1l-hiMOjynrLPsEdr0dqx4KoKRBNl4w8AdY5E-52D2bwe0T73QDNh-E6KayAmqMBWkFjMB91n-uiCCEmTaGTXXt5ECQt38cXb0chFsSgnVyTGMswfuGNcBdouMWvLrlWjchawZx5bZNE1KdM7",
      isTall: true,
    },
    {
      id: 3,
      type: "野外考查",
      year: "1985",
      title: "准噶尔盆地考察队",
      desc: "大型脊椎动物化石点勘测作业中。",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB25K57vwLEY5zxFhFrAtSD7_IvnQKDpz7oy1_eCha4iFiFMWEpqwj_jWaAfItQsEmcAi4qOLxu_H88fH-R_vhgU_BCNUUPPjCGN8EXVl_ZTlx8rpiMXzfdOg9juyY4aaZMhSVTBF6FyfZfeNaPNUhucnQ0lvBruRF8MMs8T-zS5DtFZnkN0iIPvocvd8gVqhQadmwpXFRAdCHl58PMoj5QFDAxZpf31clu4jofh4WKQdxeB1_x3GEvD7sAsW8oJ6vv7v4rYeODHcnq",
    },
    {
      id: 4,
      type: "学术会议",
      year: "1978",
      title: "第十二届全国会员代表大会",
      desc: "见证古生物学在改革开放初期的复苏与繁荣。",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjZfORmeFWV_tYlMskpFVpfrbdaEV5hD1JJC3VXj8q8W3Dd9T0G0vYYK31u2xgJigrBnI35lp9rzNXz2-rQaqgy7EPx0FdEXdhZiV7dCGuVNZKEPUj6iPpZUaGmney9AkpuSOjhwAnqauS_BUT8uuvCRAChezNopysJniE3cQUrsDCL9rvdAoXFW9fZ87ppEwFDc2CzksjLu8IZAxwY1ea_JDSF8HSnMCrFmWMdI9argKaKg4CSET58daVzvEcJHsCemAPydR-gB6n",
    },
    {
      id: 5,
      type: "国际交流",
      year: "2012",
      title: "中德联合化石考察结项会",
      desc: "深化全球科学合作，共同揭示地球生命演化奥秘。",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfI0qpDbwa-TBSFeSqXHQkk2hpqkD0yMLURcxT4G06wOv6QNuy8nnUc-pxASftIo4-MJrQctDXqqPy_wp0ZX8zGv8qBknwp4U357YfU_5JL0_7NiqUCc-iN4DMjpyedkQmGO-3J_jZhCYcIVQdivqNjqVgX4sYAvG0o3E31V2Q9A02R4U-1mSDfeRme8ZNeItucm2NwPDR5uNoxWonU8CM7M0wb3OyGgjqCR8tVMADExC90a41dhRk-l5Uun66ukfFYzn5h5Igcq_z",
      isWide: true,
    },
  ];

  const filteredItems = activeFilter === "全部瞬间"
    ? items
    : items.filter(item => item.type === activeFilter);

  return (
    <PartyLayout currentPageTitle="历史相册">
      <div className="space-y-12">
        {/* Header Section */}
        <header className="mb-10 border-b-2 border-amber-200 pb-4" style={{ borderBottomColor: "#f5e0ba" }}>
          <h1 className="text-3xl font-bold text-primary mb-2">光影历程</h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            记录中国古生物学百年足迹，从早期的艰苦探索到现代的卓越突破，每一帧影像都是科学精神的永恒传承。
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 font-semibold text-xs tracking-wider uppercase rounded-lg transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-primary text-white shadow-sm"
                  : "border border-fossil-stone bg-white hover:bg-slate-100 text-slate-700"
              }`}
              style={activeFilter === filter ? { backgroundColor: "#002B49" } : {}}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={`relative overflow-hidden group cursor-pointer border border-fossil-stone rounded-lg bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-2 border-t-amber-200 ${
                item.isWide ? "md:col-span-2" : ""
              } ${item.isTall ? "md:row-span-2" : ""}`}
              style={{ borderTopColor: "#d8c49f" }}
            >
              <img
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={item.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-amber-200 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#f5e0ba" }}>
                  {item.type} • {item.year}
                </span>
                <h3 className="text-white text-lg font-bold">{item.title}</h3>
                <p className="text-white/80 text-xs mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-fossil-stone rounded hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-primary" style={{ color: "#002B49" }}>chevron_left</span>
          </button>
          <span className="w-10 h-10 flex items-center justify-center bg-primary text-white font-bold text-xs rounded shadow-sm" style={{ backgroundColor: "#002B49" }}>
            1
          </span>
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-fossil-stone rounded hover:bg-slate-100 transition-colors text-slate-700 text-xs font-semibold">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-fossil-stone rounded hover:bg-slate-100 transition-colors text-slate-700 text-xs font-semibold">
            3
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-fossil-stone rounded hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-primary" style={{ color: "#002B49" }}>chevron_right</span>
          </button>
        </div>
      </div>
    </PartyLayout>
  );
}
