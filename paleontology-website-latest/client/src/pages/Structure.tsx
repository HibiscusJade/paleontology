import React from "react";
import PartyLayout from "../components/PartyLayout";

export default function Structure() {
  return (
    <PartyLayout currentPageTitle="组织机构">
      <div className="space-y-12">
        {/* Header Section */}
        <header className="mb-10 border-l-4 border-secondary pl-6" style={{ borderColor: "#715a3e" }}>
          <h1 className="text-3xl font-bold text-primary">组织机构</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            中国古生物学会设理事会、常务理事会及若干专业委员会。致力于团结全国古生物学工作者，促进学科繁荣与科学普及。
          </p>
        </header>

        {/* Council Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-primary">第十二届理事会领导成员</h3>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Leadership Cards */}
            <div className="bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed p-6 relative overflow-hidden group rounded shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest block mb-2" style={{ color: "#715a3e" }}>President</span>
              <h4 className="text-xl font-bold text-primary mb-1">詹仁斌</h4>
              <p className="text-xs text-slate-500">理事长</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-600">中国科学院南京地质古生物研究所</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
            <div className="bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed p-6 relative overflow-hidden group rounded shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest block mb-2" style={{ color: "#715a3e" }}>Vice President</span>
              <h4 className="text-xl font-bold text-primary mb-1">邓涛</h4>
              <p className="text-xs text-slate-500">副理事长</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-600">中国科学院古脊椎动物与古人类研究所</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
            <div className="bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed p-6 relative overflow-hidden group rounded shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest block mb-2" style={{ color: "#715a3e" }}>Secretary General</span>
              <h4 className="text-xl font-bold text-primary mb-1">张元动</h4>
              <p className="text-xs text-slate-500">秘书长 (兼)</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-600">中国科学院南京地质古生物研究所</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Executive Members */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-primary">常务理事会成员</h3>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <div className="bg-white border border-fossil-stone overflow-hidden rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white" style={{ backgroundColor: "#002B49" }}>
                  <th className="p-4 text-xs font-semibold tracking-wider uppercase">姓名</th>
                  <th className="p-4 text-xs font-semibold tracking-wider uppercase">所属单位</th>
                  <th className="p-4 text-xs font-semibold tracking-wider uppercase">研究方向</th>
                  <th className="p-4 text-xs font-semibold tracking-wider uppercase">职务</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">白武备</td>
                  <td className="p-4 text-sm text-slate-600">中国地质大学（北京）</td>
                  <td className="p-4 text-sm text-slate-600 italic">微体古生物学</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-tertiary-fixed text-amber-900 text-[10px] font-bold uppercase rounded" style={{ backgroundColor: "#f5e0ba" }}>常务理事</span>
                  </td>
                </tr>
                <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">陈中强</td>
                  <td className="p-4 text-sm text-slate-600">中国地质大学（武汉）</td>
                  <td className="p-4 text-sm text-slate-600 italic">古生态学</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-tertiary-fixed text-amber-900 text-[10px] font-bold uppercase rounded" style={{ backgroundColor: "#f5e0ba" }}>常务理事</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">季强</td>
                  <td className="p-4 text-sm text-slate-600">中国地质科学院地质研究所</td>
                  <td className="p-4 text-sm text-slate-600 italic">脊椎动物古生物学</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-tertiary-fixed text-amber-900 text-[10px] font-bold uppercase rounded" style={{ backgroundColor: "#f5e0ba" }}>常务理事</span>
                  </td>
                </tr>
                <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">刘建妮</td>
                  <td className="p-4 text-sm text-slate-600">西北大学</td>
                  <td className="p-4 text-sm text-slate-600 italic">早期生命演化</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-tertiary-fixed text-amber-900 text-[10px] font-bold uppercase rounded" style={{ backgroundColor: "#f5e0ba" }}>常务理事</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Professional Committees */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-primary">专业委员会</h3>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Committee Items */}
            <div className="flex items-start gap-4 p-4 bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 flex-shrink-0 bg-sky-100 text-primary flex items-center justify-center rounded">
                <span className="material-symbols-outlined">magnification_small</span>
              </div>
              <div>
                <h5 className="text-base font-bold text-primary group-hover:text-secondary">微体古生物学分会</h5>
                <p className="text-xs text-slate-500 mt-1">挂靠单位：中国科学院南京地质古生物研究所</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Micro-Paleo</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Research</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 flex-shrink-0 bg-sky-100 text-primary flex items-center justify-center rounded">
                <span className="material-symbols-outlined">pets</span>
              </div>
              <div>
                <h5 className="text-base font-bold text-primary group-hover:text-secondary">古脊椎动物学分会</h5>
                <p className="text-xs text-slate-500 mt-1">挂靠单位：中国科学院古脊椎动物与古人类研究所</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Vertebrate</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Evolution</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 flex-shrink-0 bg-sky-100 text-primary flex items-center justify-center rounded">
                <span className="material-symbols-outlined">forest</span>
              </div>
              <div>
                <h5 className="text-base font-bold text-primary group-hover:text-secondary">古植物学分会</h5>
                <p className="text-xs text-slate-500 mt-1">挂靠单位：沈阳师范大学</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Paleobotany</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Ecology</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 flex-shrink-0 bg-sky-100 text-primary flex items-center justify-center rounded">
                <span className="material-symbols-outlined">waves</span>
              </div>
              <div>
                <h5 className="text-base font-bold text-primary group-hover:text-secondary">化石藻类专业委员会</h5>
                <p className="text-xs text-slate-500 mt-1">挂靠单位：南京大学</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Algae</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">Marine</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map/Location Section */}
        <section className="w-full bg-slate-50 border border-fossil-stone rounded-lg overflow-hidden relative shadow-sm">
          <div className="w-full h-80 relative">
            <img alt="Map Background" className="w-full h-full object-cover opacity-10 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUrHegFS8W0KOHa2y7oN-0o0mOe5LvysPhs_JfYpbFhOypkUm1ariK42fTNGFlnRENwcAk8syiRPldkqHp6CoHeXnM7iKcbbSltWrjjEELvlcOq8OXwsODb0YbRukmwcmQV4BxIPXGV1GKkK_NMb4guAMsQjlV1v8jLkIfTSQ2mE6JzRrBc-uOKWy1Zy15jrSOXpCqvUHzepek05f3iZ-lBj28Uv5D2aiwBMC-e7492vfVVpc19lq9XLSpDnW8F9s5CM-SHOCQgeFP" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl font-bold text-primary mb-2">秘书处所在地</h3>
              <p className="text-sm text-slate-700 max-w-md leading-relaxed">
                中国科学院南京地质古生物研究所<br />江苏省南京市北京东路39号
              </p>
              <div className="mt-6">
                <a 
                  href="https://ditu.amap.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-primary text-white px-8 py-3 text-xs font-bold tracking-widest uppercase rounded hover:bg-primary-container transition-all shadow-sm"
                  style={{ backgroundColor: "#002B49" }}
                >
                  查看详细地图
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PartyLayout>
  );
}
