import React from "react";
import PartyLayout from "../components/PartyLayout";
import { Link } from "wouter";

export default function History() {
  return (
    <PartyLayout currentPageTitle="学会沿革">
      <div className="space-y-12">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">学会沿革</h1>
          <div className="h-1 w-24 bg-amber-200 mb-6" style={{ backgroundColor: "#d8c49f" }}></div>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            自1929年创立以来，中国古生物学会见证了近一个世纪中国地球科学的崛起。我们在此追溯学术脉络，致敬在深时探索中前行的先辈。
          </p>
        </header>

        {/* Hero History Image */}
        <div className="relative w-full h-[400px] mb-12 rounded-lg overflow-hidden border border-fossil-stone shadow-sm">
          <img alt="Early Palaeontology excavation" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-5UFr7wRFX7bCPr3VibXOHMw3e8uUVrVmPFzOCBdoRlyL3NPNHbAJIVZSj4y-MeIkd4GUV0XaYScTAMWf_iehw2NL0qB3tkVYY6M-BMrIQDb6FjmNxGDjPoDIg65rYIGEyaoluRwfAF0Y8BR6IZRReFnJbM8aUWlq1gbA3W2A0snXBXXdzOfZh3Re1XjXgTY5HVg0PmrDvUYPBY0hlR1FrqiAX7yIKslZLte1jow11NpNYMfMDohzZf9BgT6cwHqUDRf0DcdG303Z" />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-900/90 to-transparent">
            <p className="text-white text-xl font-bold">始于1929 · 北平</p>
          </div>
        </div>

        {/* Timeline Section */}
        <section className="relative space-y-12 py-12 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:bg-slate-200 before:hidden md:before:block">
          {/* Entry 1 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between w-full group">
            <div className="w-full md:w-[45%] bg-white p-6 border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary italic">1929</span>
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-3 py-1 rounded">创始期</span>
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">学会正式成立于北平</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                中国古生物学会在北平正式成立。首任会长孙云铸教授确立了“研究地层古生物学，促进地质科学发展”的宗旨，开启了中国古生物学的专业化进程。
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white z-10 hidden md:block" style={{ backgroundColor: "#003358" }}></div>
            <div className="w-full md:w-[45%] mt-6 md:mt-0">
              <img alt="Founding Document" className="rounded-lg border border-fossil-stone grayscale hover:grayscale-0 transition-all duration-500 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTwUcvS_etbSaiO4Cd0WEQgmJoZUz82bVz6gv1YSo1zTu0IPPIf5ubphGCuyCaAIqjg5DU0x-PFoKgD4aSHhNv39rctg9pHlj3-enoc0BUgXA7z51LM33t0Wl_GEm0QbvCtH0qcP73xMGhEjBTHeIlZR-0fEoEMxFTXrVs1rgQDgKwCxhYumu5vpOsthqmWD1rTfEidE2NkbIw_1EpBYktvbmTGWvVhC5XI6T_NWvR6fBle9HpfP_NhyXdI2VL2sBvhOVCTjY2vmyv" />
            </div>
          </div>

          {/* Entry 2 */}
          <div className="relative flex flex-col md:flex-row-reverse items-center justify-between w-full group">
            <div className="w-full md:w-[45%] bg-white p-6 border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary italic">1953</span>
                <span className="text-xs font-semibold bg-sky-100 text-sky-900 px-3 py-1 rounded">重建期</span>
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">恢复活动与体制改革</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                在新中国成立初期，学会完成重组，纳入中国科学技术协会体系。确立了以中科院南京地质古生物研究所为挂靠单位的格局，学术交流步入正轨。
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-secondary border-4 border-white z-10 hidden md:block" style={{ backgroundColor: "#715a3e" }}></div>
            <div className="w-full md:w-[45%] mt-6 md:mt-0">
              <img alt="Academic Building" className="rounded-lg border border-fossil-stone brightness-95 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ8G9ThwtCvLIQvJ8vwA6iulzr3pCzeWrjOW884h25kS3M_quKl4yumWY6r7Rm1l-O6_3wvgZ-dNu-7Wq1CoQDrUmYHobD6NyOZ4mPZYKaCFRqPcbAvUPZtN9_PShGQ4mPRjDWcE7HUs709vo2tsKIcJV_E769taRa6Rjxlrma8FgDw9Jm59XOXK6PjRLsbys2A67hNCDjOrHiBdGkv3xjYMHpBZi2pCeoqXo6oSgaG9YeDLusEErx809DhuoXcixyCswmr78NCvge" />
            </div>
          </div>

          {/* Entry 3 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between w-full group">
            <div className="w-full md:w-[45%] bg-white p-6 border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary italic">1980s</span>
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-3 py-1 rounded">开放期</span>
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">走向世界与分会建立</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                伴随改革开放，学会积极申办国际学术会议。微体古生物、脊椎动物古生物等专业委员会相继成立，科研成果在国际顶级刊物崭露头角。
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white z-10 hidden md:block" style={{ backgroundColor: "#003358" }}></div>
            <div className="w-full md:w-[45%] mt-6 md:mt-0">
              <div className="grid grid-cols-2 gap-2">
                <img className="rounded border border-fossil-stone shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEvYlo35Mb6q9OEif5aa6iUiP_oq9priQhtcpe-0yjuaIob_LuMN0Qk_l-TGY8-vJxDv_JPbtsodY4OMnqv0GM3mpkoO_sw9xrFv8cEYcFcs3j2HI20DqGKdvyUWajysaqIpyQ4EoO7V5NZrCLude6NvtkKHx-9bZTZfsj2QCuo7cQ3_CcV2uTZVLvN2uDbwMaUEd0-3G9cmM-amGpmFxDrkYsPf1woZ7tEO3cXVENfjl3yY5jfnSHA7R7t6LBj6DqNqQ0tW-RrXzH" alt="Field work" />
                <img className="rounded border border-fossil-stone shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjKraqrbMqWPOSE1Wd4UALATakyui7C5eM-MbMv4Ew_Z25M3z51y5m6Nx90msiURPjYpzo8MrAgw0ye8aAyZ1AAYTlZrSuGoJ7XGx4JLDYOfRXQbwnX0rjQflLMJ1cUMEoW6xkZ7SYuxpkiQyulk4zPAN5M_Ru4RnM3RBGM2HFhiNoekV47NoRXli5Ta7LKZccWgfFagpW4RJ_S5YZ8t2jx5mhnLaEAJ-Q3_aQH98y4_sMU5_kwpF_M486biV8tp95gYm3dtImBvXE" alt="Scientific archive" />
              </div>
            </div>
          </div>

          {/* Entry 4 */}
          <div className="relative flex flex-col md:flex-row-reverse items-center justify-between w-full group">
            <div className="w-full md:w-[45%] bg-white p-6 border border-fossil-stone border-t-2 border-t-tertiary-fixed rounded shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary italic">2024</span>
                <span className="text-xs font-semibold bg-sky-100 text-sky-900 px-3 py-1 rounded">现代期</span>
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">数字化科普与跨学科融合</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                今日的学会不仅致力于前沿学术，更通过数字化平台推广科普教育。从澄江化石库到热河生物群，我们正以前所未有的深度解读地球生命演化史。
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-secondary border-4 border-white z-10 hidden md:block" style={{ backgroundColor: "#715a3e" }}></div>
            <div className="w-full md:w-[45%] mt-6 md:mt-0">
              <img alt="Modern Digital Lab" className="rounded-lg border border-fossil-stone shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyTKTuOClC2NrDhGV0RsbzsY1uDVAhAT-kHBgPHoL0zqD_g2m2-4qIXjLaLn17Bg5CcjjJzauv-qQExBHILdlR6c3h505HWWLsFm_s0XFMEpTYgkkn7DtXzLitHeTDBW3cfwIQN2TvlZNpGbQqZMybinSUTGuupgYeZFl7yx0UBJGdWhu12R8QsSORvIYIb1daqBLZJsXnRiDLpuHYcG-e0mX_sLUYC7qO6Z0FSXRBKpEzp5RBMD2q4rS3Xj7OmQUb1p87eJbleoEc" />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-slate-900 rounded-lg text-center border-t-4 border-amber-200 shadow-lg" style={{ backgroundColor: "#002B49", borderTopColor: "#f5e0ba" }}>
          <h3 className="text-xl font-bold text-white mb-4">深入了解我们的历史遗产</h3>
          <p className="text-sm text-slate-300 mb-6">访问历史相册，浏览更多珍贵的学术瞬间与人物影像。</p>
          <Link href="/gallery">
            <button className="bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto" style={{ backgroundColor: "#715a3e" }}>
              进入历史相册 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </Link>
        </div>
      </div>
    </PartyLayout>
  );
}
