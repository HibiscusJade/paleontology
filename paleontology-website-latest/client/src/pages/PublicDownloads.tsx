import { useState, useMemo } from "react";

// ── 类型（与 admin cms-data.ts 保持一致） ─────────────────────────────────
type CmsPublicFileCategory = "document" | "audio" | "video" | "photo";

interface CmsPublicFile {
  id: string;
  title: string;
  category: CmsPublicFileCategory;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  remark: string;
  downloadCount: number;
  uploadDate: string;
  deleted: boolean;
}

// ── 常量 ──────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<CmsPublicFileCategory, string> = {
  document: "文档类",
  audio: "音频类",
  video: "影视类",
  photo: "照片类",
};

const CATEGORY_FORMATS: Record<CmsPublicFileCategory, string> = {
  document: "Word · PDF · Excel · PPT · 压缩包",
  audio: "MP3 · WAV · M4A",
  video: "MP4 · AVI · MOV · WMV · MKV · FLV",
  photo: "JPEG · PNG · GIF · TIFF",
};

const CATEGORY_ICONS: Record<CmsPublicFileCategory, string> = {
  document: "description",
  audio: "music_note",
  video: "videocam",
  photo: "photo_library",
};

const CATEGORY_COLORS: Record<CmsPublicFileCategory, { tab: string; badge: string; icon: string }> = {
  document: { tab: "text-blue-700 border-blue-700", badge: "bg-blue-50 text-blue-800 border-blue-200", icon: "text-blue-600" },
  audio:    { tab: "text-green-700 border-green-700", badge: "bg-green-50 text-green-800 border-green-200", icon: "text-green-600" },
  video:    { tab: "text-purple-700 border-purple-700", badge: "bg-purple-50 text-purple-800 border-purple-200", icon: "text-purple-600" },
  photo:    { tab: "text-amber-700 border-amber-700", badge: "bg-amber-50 text-amber-800 border-amber-200", icon: "text-amber-600" },
};

const FILE_EXT_ICONS: Record<string, string> = {
  pdf: "picture_as_pdf",
  doc: "article", docx: "article",
  xls: "table_chart", xlsx: "table_chart",
  ppt: "slideshow", pptx: "slideshow",
  zip: "folder_zip", rar: "folder_zip",
  mp3: "music_note", wav: "music_note", m4a: "music_note",
  mp4: "videocam", avi: "videocam", mov: "videocam", wmv: "videocam", mkv: "movie", flv: "movie",
  jpeg: "image", jpg: "image", png: "image", gif: "gif_box", tiff: "image",
};

function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return FILE_EXT_ICONS[ext] ?? "attach_file";
}

// ── 读取 CMS 公开文件（与 admin localStorage 共享） ──────────────────────
const CMS_STORAGE_KEY = "paleo_admin_cms_db";

function loadPublicFiles(): CmsPublicFile[] {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      return (db.publicFiles ?? []).filter((f: CmsPublicFile) => !f.deleted);
    }
  } catch { /* ignore */ }
  // 默认示例数据
  return [
    {
      id: "pf-1", title: "2026年学会图片大赛参赛规则与投稿说明", category: "document",
      fileName: "2026图片大赛参赛规则.pdf", fileUrl: "/media/photo-contest-2026.pdf",
      fileSize: "256 KB", remark: "适用于学会年度图片大赛参赛者",
      downloadCount: 0, uploadDate: "2026-06-18", deleted: false,
    },
    {
      id: "pf-2", title: "科普讲解大赛选手报名表（Word版）", category: "document",
      fileName: "科普讲解大赛报名表.docx", fileUrl: "/media/kepu-signup.docx",
      fileSize: "88 KB", remark: "填写完毕后发送至组委会邮箱",
      downloadCount: 0, uploadDate: "2026-06-18", deleted: false,
    },
    {
      id: "pf-3", title: "党组织学习教育活动宣传片（示例）", category: "video",
      fileName: "党建学习宣传片示例.mp4", fileUrl: "/media/party-promo.mp4",
      fileSize: "128 MB", remark: "供各分会党支部参考学习使用",
      downloadCount: 0, uploadDate: "2026-06-15", deleted: false,
    },
    {
      id: "pf-4", title: "古生物学会2025年优秀图片合集", category: "photo",
      fileName: "2025优秀图片合集.zip", fileUrl: "/media/photo-2025.zip",
      fileSize: "512 MB", remark: "2025年度图片大赛优秀作品集锦",
      downloadCount: 0, uploadDate: "2026-01-10", deleted: false,
    },
  ];
}

// ── 主组件 ────────────────────────────────────────────────────────────────
export default function PublicDownloads() {
  const [activeCategory, setActiveCategory] = useState<CmsPublicFileCategory>("document");
  const [searchText, setSearchText] = useState("");
  const allFiles = useMemo(() => loadPublicFiles(), []);

  const filtered = useMemo(() => {
    return allFiles
      .filter(f => f.category === activeCategory)
      .filter(f => !searchText || f.title.toLowerCase().includes(searchText.toLowerCase()) || f.fileName.toLowerCase().includes(searchText.toLowerCase()))
      .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
  }, [allFiles, activeCategory, searchText]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    allFiles.forEach(f => { c[f.category] = (c[f.category] ?? 0) + 1; });
    return c;
  }, [allFiles]);

  const colors = CATEGORY_COLORS[activeCategory];

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* ── 顶栏 ── */}
      <header className="bg-[#002B49] text-white py-3 px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-90">
          <span className="w-8 h-8 rounded bg-[#D9C5A0]/20 flex items-center justify-center font-bold text-[#D9C5A0] text-sm">古</span>
          <span className="font-bold text-sm">中国古生物学会</span>
        </a>
        <nav className="flex gap-4 text-xs">
          <a href="/" className="hover:text-[#D9C5A0] transition-colors">首页</a>
          <a href="/news-publish" className="hover:text-[#D9C5A0] transition-colors">新闻发布</a>
          <a href="/public-downloads" className="text-[#D9C5A0] font-bold">文件下载区</a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <div className="bg-[#002B49] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-[#D9C5A0] font-bold tracking-widest mb-1">PUBLIC FILE DOWNLOADS</p>
              <h1 className="text-2xl font-bold font-serif">公开文件下载区</h1>
              <p className="text-sm text-white/60 mt-1">
                学会举办图片大赛、短视频大赛、科普讲解大赛及党组织学习教育宣传活动相关资料，无需登录即可下载。
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/10 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-[14px] text-green-400">lock_open</span>
              <span>全部文件公开下载，无需注册</span>
            </div>
          </div>

          {/* ── 搜索框 ── */}
          <div className="relative mt-5 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-white/40 text-[18px]">search</span>
            <input
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#D9C5A0] transition-colors"
              placeholder="搜索文件名称..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── 分类 Tab ── */}
      <div className="bg-white border-b border-[#E5E1DA] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {(["document", "audio", "video", "photo"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearchText(""); }}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? `border-b-[#002B49] text-[#002B49]`
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${activeCategory === cat ? "text-[#002B49]" : "text-slate-400"}`}>
                {CATEGORY_ICONS[cat]}
              </span>
              {CATEGORY_LABELS[cat]}
              {counts[cat] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat ? "bg-[#002B49] text-white" : "bg-slate-100 text-slate-500"}`}>
                  {counts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 主内容 ── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 分类说明 */}
        <div className="mb-6 flex items-center gap-3">
          <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>{CATEGORY_ICONS[activeCategory]}</span>
          <div>
            <h2 className="text-base font-bold text-[#002B49]">{CATEGORY_LABELS[activeCategory]}</h2>
            <p className="text-xs text-slate-400">{CATEGORY_FORMATS[activeCategory]}</p>
          </div>
        </div>

        {/* 文件列表 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-3 block">{CATEGORY_ICONS[activeCategory]}</span>
            <p className="text-sm font-bold">
              {searchText ? `未找到包含「${searchText}」的${CATEGORY_LABELS[activeCategory]}文件` : `暂无${CATEGORY_LABELS[activeCategory]}文件`}
            </p>
            {searchText && (
              <button onClick={() => setSearchText("")} className="mt-3 text-xs text-[#002B49] underline">清除搜索</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(file => {
              const ext = file.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
              const extBg = activeCategory === "document" ? "bg-blue-100 text-blue-800"
                : activeCategory === "audio" ? "bg-green-100 text-green-800"
                : activeCategory === "video" ? "bg-purple-100 text-purple-800"
                : "bg-amber-100 text-amber-800";

              return (
                <div key={file.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
                  {/* 文件图标 */}
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${
                    activeCategory === "document" ? "bg-blue-50" :
                    activeCategory === "audio" ? "bg-green-50" :
                    activeCategory === "video" ? "bg-purple-50" : "bg-amber-50"
                  }`}>
                    <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>
                      {getFileIcon(file.fileName)}
                    </span>
                  </div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors.badge}`}>{ext}</span>
                      <h3 className="font-bold text-[#002B49] text-sm truncate">{file.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-mono">{file.fileName}</span>
                      {file.fileSize && <span>· {file.fileSize}</span>}
                      <span>· 上传于 {file.uploadDate}</span>
                      <span>· 已下载 {file.downloadCount} 次</span>
                    </div>
                    {file.remark && (
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">info</span>
                        {file.remark}
                      </p>
                    )}
                  </div>

                  {/* 下载按钮 */}
                  <a
                    href={file.fileUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 bg-[#002B49] hover:bg-[#001f35] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:shadow-md active:scale-95"
                    onClick={() => {
                      // 在原型中模拟增加下载次数
                      try {
                        const raw = localStorage.getItem("paleo_admin_cms_db");
                        if (raw) {
                          const db = JSON.parse(raw);
                          db.publicFiles = (db.publicFiles ?? []).map((f: CmsPublicFile) =>
                            f.id === file.id ? { ...f, downloadCount: (f.downloadCount ?? 0) + 1 } : f
                          );
                          localStorage.setItem("paleo_admin_cms_db", JSON.stringify(db));
                        }
                      } catch { /* ignore */ }
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    下载
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部格式说明 */}
        <div className="mt-10 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#002B49] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">help_outline</span>
            支持的文件格式说明
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-xs">
            {(["document", "audio", "video", "photo"] as const).map(cat => (
              <div key={cat} className={`rounded-lg p-3 border ${CATEGORY_COLORS[cat].badge}`}>
                <div className="flex items-center gap-2 mb-2 font-bold">
                  <span className="material-symbols-outlined text-[14px]">{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </div>
                <p className="leading-relaxed opacity-80">{CATEGORY_FORMATS[cat]}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-start gap-1">
            <span className="material-symbols-outlined text-[12px] mt-0.5 shrink-0">info</span>
            所有文件均由学会管理员上传并审核，无需登录即可下载；下载行为自动记录用于统计。
            如需上传材料参赛或投稿，请按活动通知要求发送至对应邮箱。
          </p>
        </div>
      </main>

      {/* ── 底部 ── */}
      <footer className="bg-[#002B49] text-white/60 text-xs py-4 px-6 text-center mt-8">
        © 2026 中国古生物学会 版权所有 |{" "}
        <a href="/news-publish" className="hover:text-white transition-colors">新闻发布</a>
        {" "}|{" "}
        <a href="/society-announcements" className="hover:text-white transition-colors">会员公告</a>
        {" "}|{" "}
        <a href="/downloads-center" className="hover:text-white transition-colors">会员资料下载</a>
      </footer>
    </div>
  );
}
