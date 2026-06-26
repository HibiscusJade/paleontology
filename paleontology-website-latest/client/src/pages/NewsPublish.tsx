import { useState, useMemo } from "react";

// ── 类型定义（与 admin cms-data.ts 一致） ──────────────────────────────────
type CmsBoardType = "meeting_notice" | "party_public" | "important_news";
type CmsContentStatus = "draft" | "published" | "archived";
type CmsOriginalFileCategory = "document" | "audio" | "video" | "photo";

interface CmsOriginalFile {
  name: string;
  url: string;
  category: CmsOriginalFileCategory;
}

interface CmsPublishArticle {
  id: string;
  boardType: CmsBoardType;
  title: string;
  summary: string;
  content: string;
  coverUrl: string;
  publishDate: string;
  status: CmsContentStatus;
  originalFile: CmsOriginalFile | null;
  createdBy: string;
}

interface CmsBoardCovers {
  meeting_notice: string;
  party_public: string;
  important_news: string;
}

// ── 常量 ──────────────────────────────────────────────────────────────────
const BOARD_TYPE_LABELS: Record<CmsBoardType, string> = {
  meeting_notice: "会议通知",
  party_public: "党务公开",
  important_news: "重要新闻",
};

const FILE_CATEGORY_LABELS: Record<CmsOriginalFileCategory, string> = {
  document: "文档类",
  audio: "音频类",
  video: "影视类",
  photo: "照片类",
};

const FILE_CATEGORY_ICONS: Record<CmsOriginalFileCategory, string> = {
  document: "description",
  audio: "music_note",
  video: "videocam",
  photo: "photo_library",
};

const BOARD_TYPE_COLORS: Record<CmsBoardType, { bg: string; text: string; badge: string }> = {
  meeting_notice: { bg: "bg-blue-700", text: "text-white", badge: "bg-blue-100 text-blue-800" },
  party_public: { bg: "bg-red-700", text: "text-white", badge: "bg-red-100 text-red-800" },
  important_news: { bg: "bg-[#002B49]", text: "text-white", badge: "bg-amber-100 text-amber-800" },
};

// ── 读取 CMS 数据（与 admin 共享 localStorage） ────────────────────────────
const CMS_STORAGE_KEY = "paleo_admin_cms_db";

function loadPublishData(): { articles: CmsPublishArticle[]; boardCovers: CmsBoardCovers } {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      return {
        articles: (db.publishArticles ?? []) as CmsPublishArticle[],
        boardCovers: {
          meeting_notice: db.boardCovers?.meeting_notice ?? "",
          party_public: db.boardCovers?.party_public ?? "",
          important_news: db.boardCovers?.important_news ?? "",
        },
      };
    }
  } catch { /* ignore */ }
  // 默认示例数据（admin 未初始化时展示）
  return {
    articles: [
      {
        id: "pub-1",
        boardType: "meeting_notice",
        title: "关于举办2026年中国古生物学会学术年会的第一轮通知",
        summary: "中国古生物学会学术年会定于2026年9月在南京召开，现发布第一轮通知，请各位会员关注。",
        content: "<p>经学会理事会审议，中国古生物学会2026年学术年会将于2026年9月18日至21日在南京举行。本次年会以【古生物学与地球生命演化】为主题，欢迎广大会员踊跃投稿与参会。</p><p>报名与投稿详情将于第二轮通知发布，敬请关注。</p>",
        coverUrl: "",
        publishDate: "2026-06-20",
        status: "published",
        originalFile: { name: "2026年学术年会第一轮通知.pdf", url: "/media/meeting-notice-2026.pdf", category: "document" },
        createdBy: "admin",
      },
      {
        id: "pub-2",
        boardType: "party_public",
        title: "中国古生物学会功能性党委2026年上半年工作总结",
        summary: "学会功能性党委认真贯彻党的方针政策，积极开展党建工作，现予以公开。",
        content: "<p>2026年上半年，学会功能性党委围绕中心工作，扎实推进党建各项任务，组织全体党员开展专题学习6次，召开组织生活会2次，发展新党员1名。</p>",
        coverUrl: "",
        publishDate: "2026-06-15",
        status: "published",
        originalFile: { name: "2026年上半年党建工作总结.docx", url: "/media/party-summary-2026.docx", category: "document" },
        createdBy: "admin",
      },
      {
        id: "pub-3",
        boardType: "important_news",
        title: "中国古生物学会天体生物学分会正式成立",
        summary: "中国古生物学会天体生物学分会成立大会在南京召开，标志着学会学科布局进一步完善。",
        content: "<p>2026年6月10日，中国古生物学会天体生物学分会成立大会在南京地质古生物研究所隆重召开。学会理事长及多位院士出席成立仪式。</p>",
        coverUrl: "",
        publishDate: "2026-06-10",
        status: "published",
        originalFile: null,
        createdBy: "admin",
      },
    ],
    boardCovers: { meeting_notice: "", party_public: "", important_news: "" },
  };
}

// ── 组件 ──────────────────────────────────────────────────────────────────
export default function NewsPublish() {
  const [activeBoard, setActiveBoard] = useState<CmsBoardType>("meeting_notice");
  const [selectedArticle, setSelectedArticle] = useState<CmsPublishArticle | null>(null);
  const { articles, boardCovers } = useMemo(() => loadPublishData(), []);

  const publishedArticles = useMemo(
    () => articles.filter(a => a.status === "published" && a.boardType === activeBoard)
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate)),
    [articles, activeBoard]
  );

  const colorSet = BOARD_TYPE_COLORS[activeBoard];
  const coverUrl = boardCovers[activeBoard];

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
          <a href="/society-announcements" className="hover:text-[#D9C5A0] transition-colors">会员公告</a>
          <a href="/news-publish" className="text-[#D9C5A0] font-bold">新闻发布</a>
        </nav>
      </header>

      {/* ── 板块 Tab 切换 ── */}
      <div className={`${colorSet.bg} ${colorSet.text}`}>
        {/* 背景图 */}
        {coverUrl && (
          <div
            className="w-full h-32 bg-cover bg-center opacity-30 absolute"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
        )}
        <div className="relative max-w-5xl mx-auto px-6 pt-6 pb-0">
          <h1 className="text-2xl font-bold mb-1 font-serif">新闻发布</h1>
          <p className="text-xs opacity-70 mb-4">会议通知 · 党务公开 · 重要新闻</p>
          <div className="flex gap-0 border-b border-white/20">
            {(["meeting_notice", "party_public", "important_news"] as const).map(type => (
              <button
                key={type}
                onClick={() => { setActiveBoard(type); setSelectedArticle(null); }}
                className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeBoard === type
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white/90"
                }`}
              >
                {BOARD_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 主内容区 ── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {selectedArticle ? (
          /* ── 文章详情 ── */
          <div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#002B49] transition-colors mb-6"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              返回{BOARD_TYPE_LABELS[activeBoard]}列表
            </button>

            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* 文章封面图 */}
              {selectedArticle.coverUrl && (
                <div
                  className="w-full h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedArticle.coverUrl})` }}
                />
              )}

              <div className="p-8">
                {/* 板块 badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colorSet.badge} mb-3 inline-block`}>
                  {BOARD_TYPE_LABELS[selectedArticle.boardType]}
                </span>

                <h1 className="text-xl font-bold text-[#002B49] mb-2 font-serif leading-snug">
                  {selectedArticle.title}
                </h1>
                <p className="text-xs text-slate-400 mb-6 flex items-center gap-3">
                  <span>发布时间：{selectedArticle.publishDate}</span>
                  <span>发布人：{selectedArticle.createdBy}</span>
                </p>

                {/* 正文 */}
                <div
                  className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />

                {/* ── 原文件下载（底部） ── */}
                {selectedArticle.originalFile && (
                  <div className="mt-10 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#002B49]">download</span>
                      原文件下载
                    </h3>
                    <a
                      href={selectedArticle.originalFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={selectedArticle.originalFile.name}
                      className="inline-flex items-center gap-3 border border-[#002B49]/20 rounded-lg px-4 py-3 hover:bg-[#002B49] hover:text-white hover:border-[#002B49] transition-all group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#002B49] group-hover:text-white">
                        {FILE_CATEGORY_ICONS[selectedArticle.originalFile.category]}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#002B49] group-hover:text-white leading-tight">
                          {selectedArticle.originalFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 group-hover:text-white/70 mt-0.5">
                          {FILE_CATEGORY_LABELS[selectedArticle.originalFile.category]} · 点击下载
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[16px] ml-auto text-slate-400 group-hover:text-white/70">
                        download
                      </span>
                    </a>
                    <p className="text-[10px] text-slate-400 mt-2">
                      下载文件不要求登录，内容与「公开文件下载区」同源。
                    </p>
                  </div>
                )}
              </div>
            </article>
          </div>
        ) : (
          /* ── 文章列表 ── */
          <div>
            {/* 板块说明 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#002B49] font-serif">
                {BOARD_TYPE_LABELS[activeBoard]}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeBoard === "meeting_notice" && "学术会议相关通知公告，包括会议征文、报名信息等。"}
                {activeBoard === "party_public" && "党务活动、党建文化公开信息，践行党务公开要求。"}
                {activeBoard === "important_news" && "学会动态、重要公告等新闻发布，及时传递学会最新信息。"}
              </p>
            </div>

            {publishedArticles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">article</span>
                <p className="text-sm">暂无已发布的{BOARD_TYPE_LABELS[activeBoard]}内容</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedArticles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* 封面缩略图 */}
                      {article.coverUrl ? (
                        <div
                          className="w-20 h-16 rounded bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url(${article.coverUrl})` }}
                        />
                      ) : (
                        <div className={`w-20 h-16 rounded shrink-0 ${colorSet.bg} flex items-center justify-center opacity-80`}>
                          <span className="material-symbols-outlined text-white text-2xl">article</span>
                        </div>
                      )}

                      {/* 文章信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorSet.badge}`}>
                            {BOARD_TYPE_LABELS[article.boardType]}
                          </span>
                          {article.originalFile && (
                            <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">download</span>
                              附原文件
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-[#002B49] text-sm leading-snug group-hover:text-[#004070] transition-colors mb-1.5 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <time className="text-[10px] text-slate-400">{article.publishDate}</time>
                          <span className="text-xs text-[#715a3e] font-bold flex items-center gap-0.5 group-hover:gap-1 transition-all">
                            阅读全文
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 底部 ── */}
      <footer className="bg-[#002B49] text-white/60 text-xs py-4 px-6 text-center mt-12">
        © 2026 中国古生物学会 版权所有 |{" "}
        <a href="/downloads-center" className="hover:text-white transition-colors">公开文件下载区</a>
        {" "}|{" "}
        <a href="/society-announcements" className="hover:text-white transition-colors">会员公告</a>
      </footer>
    </div>
  );
}
