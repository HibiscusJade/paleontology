export type CmsContentStatus = "draft" | "published" | "archived";

export interface CmsAttachment {
  id: string;
  name: string;
  url: string;
  memberOnly: boolean;
}

export interface CmsBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sort: number;
  branchId: string | null;
  enabled: boolean;
}

export interface CmsArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: CmsContentStatus;
  pinned: boolean;
  publishDate: string;
  branchId: string | null;
  scope: "society" | "party" | "branch";
  attachments: CmsAttachment[];
  showOnHomepage: boolean;
}

export interface CmsPage {
  id: string;
  code: string;
  title: string;
  content: string;
  status: CmsContentStatus;
  branchId: string | null;
  updatedAt: string;
  pageType: "richtext" | "party" | "branch";
}

export interface CmsPerson {
  id: string;
  name: string;
  title: string;
  group: string;
  bio: string;
  photoUrl: string;
  sort: number;
  branchId: string | null;
}

export interface CmsGalleryPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  sort: number;
  branchId: string | null;
}

export interface CmsAward {
  id: string;
  year: string;
  awardName: string;
  winner: string;
  description: string;
  branchId: string | null;
}

export interface CmsScienceItem {
  id: string;
  title: string;
  format: "article" | "video" | "base" | "book" | "fossil";
  category: string;
  summary: string;
  content: string;
  externalUrl: string;
  status: CmsContentStatus;
  branchId: string | null;
  publishDate: string;
}

export interface CmsInternationalItem {
  id: string;
  title: string;
  type: "news" | "conference" | "partner";
  summary: string;
  content: string;
  linkUrl: string;
  logoUrl: string;
  status: CmsContentStatus;
  publishDate: string;
}

export interface CmsTechRewardItem {
  id: string;
  title: string;
  type: "intro" | "guide";
  content: string;
  status: CmsContentStatus;
  updatedAt: string;
}

export interface CmsPartyArticle {
  id: string;
  column: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: CmsContentStatus;
  pinned: boolean;
  publishDate: string;
}

export interface CmsPartyTopic {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  articleIds: string[];
  status: CmsContentStatus;
}

export interface CmsDownloadFile {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileUrl: string;
  memberOnly: boolean;
  branchId: string | null;
  scope: "society" | "party" | "branch";
}

export interface CmsTimelineNode {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: string;
  sort: number;
  branchId: string | null;
}

export interface CmsMediaItem {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  category: string;
  url: string;
  sizeLabel: string;
  uploadedAt: string;
  refCount: number;
}

export interface CmsQuickLink {
  id: string;
  label: string;
  path: string;
  icon: string;
  sort: number;
  enabled: boolean;
}

export interface CmsSiteConfig {
  copyright: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  friendLinks: { name: string; url: string }[];
  quickLinks: CmsQuickLink[];
}

export interface CmsDatabase {
  banners: CmsBanner[];
  news: CmsArticle[];
  announcements: CmsArticle[];
  pages: CmsPage[];
  personnel: CmsPerson[];
  galleryPhotos: CmsGalleryPhoto[];
  awards: CmsAward[];
  scienceItems: CmsScienceItem[];
  internationalItems: CmsInternationalItem[];
  techRewardItems: CmsTechRewardItem[];
  partyArticles: CmsPartyArticle[];
  partyTopics: CmsPartyTopic[];
  downloadFiles: CmsDownloadFile[];
  timelineNodes: CmsTimelineNode[];
  media: CmsMediaItem[];
  siteConfig: CmsSiteConfig;
}

export const CMS_STORAGE_KEY = "paleo_admin_cms_db";
export const CMS_SCHEMA_VERSION = 2;

export const PARTY_COLUMNS = [
  { code: "party_announcement", label: "通知公告" },
  { code: "party_organizations", label: "党群机构" },
  { code: "party_committees", label: "党委纪委" },
  { code: "party_work", label: "党建工作" },
  { code: "party_activities", label: "组织生活" },
  { code: "party_team", label: "党员队伍建设" },
  { code: "party_theory", label: "理论学习专栏" },
  { code: "party_dynamics", label: "工作动态" },
  { code: "party_exemplars", label: "先进典型" },
  { code: "party_reporting", label: "违法违纪举报" },
] as const;

export const GALLERY_CATEGORIES = ["早期风采", "学术会议", "野外考查", "国际交流"];
export const SCIENCE_CATEGORIES = ["科普文章", "科普视频", "科普基地", "学术专著", "化石保护"];
export const DOWNLOAD_CATEGORIES_SOCIETY = ["管理办法", "学术标准", "年报资料", "会员表格"];
export const DOWNLOAD_CATEGORIES_PARTY = ["入党申请书", "思想汇报", "转正申请", "其他模板"];

const DEFAULT_CMS: CmsDatabase = {
  banners: [
    {
      id: "banner-1",
      title: "中国古生物学会首页主 Banner",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNRleNYvnVjS703omdnq4SM-S4HAx1xJVPMOPltrMf3netfsxNQud338lNFjAxAV31Qvw_etAUmU7KMW1YX2RKxA0dIotwdignl1jKI4uZFvvhgyNMpO-uro4Ld7zpIKXe2gunUiSareQKqn3BzF2YiR1c6Mo4uJK52AGT3lz9FhR7rC91LMgbBgK9PpmNDIwMww8mYPVHIhMLQCaKNLMN8lTHz0YLT_5l_2At0BlIvczBqmME2kYLxSAm1wZ1q303vtfCEZnWQ4",
      linkUrl: "/intro",
      sort: 1,
      branchId: null,
      enabled: true,
    },
    {
      id: "banner-2",
      title: "天体生物学分会成立专题",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuChZnLBVeHAiOhUffpt-k42OMSP1acoKVaF3_S1KcQKeIU9ajRgy1Biwa_GhbFtEtv3BIf3g3SS1UCngWdi7QQRF7WsxAgrOsw2piyH2v16Sm54ybLgj7z9fFIiG17FEShTbPhN1OMvZGMQbaLsdWz_cnv75r6TYAAY5JzDSqw-HmWW3Fgfe-aWHSPG6MeAeVBYUdQqVHsgo_KqtkjNf6S7vlUv8tUwJItYPeIsWCP_G-hdPIyoBkDMCFtc_gf-B5100oHhGAmC-hc",
      linkUrl: "/society-announcements",
      sort: 2,
      branchId: null,
      enabled: true,
    },
    {
      id: "banner-wtxfh",
      title: "微体学分会学术活动 Banner",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNRleNYvnVjS703omdnq4SM-S4HAx1xJVPMOPltrMf3netfsxNQud338lNFjAxAV31Qvw_etAUmU7KMW1YX2RKxA0dIotwdignl1jKI4uZFvvhgyNMpO-uro4Ld7zpIKXe2gunUiSareQKqn3BzF2YiR1c6Mo4uJK52AGT3lz9FhR7rC91LMgbBgK9PpmNDIwMww8mYPVHIhMLQCaKNLMN8lTHz0YLT_5l_2At0BlIvczBqmME2kYLxSAm1wZ1q303vtfCEZnWQ4",
      linkUrl: "/branches/wtxfh",
      sort: 1,
      branchId: "wtxfh",
      enabled: true,
    },
  ],
  news: [
    {
      id: "news-1",
      title: "中国古生物学会天体生物学分会在南京成立",
      category: "学会要闻",
      summary: "分会成立仪式在南京举行，学会领导及多位院士出席。",
      content: "<p>中国古生物学会天体生物学分会正式成立……</p>",
      status: "published",
      pinned: true,
      publishDate: "2026-05-20",
      branchId: null,
      scope: "society",
      attachments: [],
      showOnHomepage: true,
    },
    {
      id: "news-2",
      title: "第十五届全国微体古生物学学术研讨会筹备工作启动",
      category: "工作动态",
      summary: "微体学分会发布会议筹备通知，欢迎各会员单位关注。",
      content: "<p>会议拟定于2026年秋季召开……</p>",
      status: "published",
      pinned: false,
      publishDate: "2026-05-12",
      branchId: "wtxfh",
      scope: "branch",
      attachments: [],
      showOnHomepage: false,
    },
  ],
  announcements: [
    {
      id: "ann-1",
      title: "关于开展2026年度「中国古生物学会科学技术奖」推荐及申报工作的通知",
      category: "奖励申报",
      summary: "学会现启动2026年度科学技术奖推荐工作。",
      content: "<p>请各会员单位按要求组织申报……</p>",
      status: "published",
      pinned: true,
      publishDate: "2024-10-25",
      branchId: null,
      scope: "society",
      attachments: [{ id: "att-1", name: "申报指南.pdf", url: "/media/science-award-notice.pdf", memberOnly: false }],
      showOnHomepage: true,
    },
    {
      id: "ann-wtxfh",
      title: "微体学分会2026年会员大会通知",
      category: "组织工作",
      summary: "本分会对有效会员发布会议通知。",
      content: "<p>请本分会在籍会员查阅附件……</p>",
      status: "published",
      pinned: false,
      publishDate: "2026-06-01",
      branchId: "wtxfh",
      scope: "branch",
      attachments: [{ id: "att-w1", name: "会议通知.pdf", url: "/media/branch-notice.pdf", memberOnly: true }],
      showOnHomepage: true,
    },
  ],
  pages: [
    {
      id: "page-1",
      code: "intro_overview",
      title: "学会概况",
      content: "<p>中国古生物学会成立于1929年，是全国性学术团体……</p>",
      status: "published",
      branchId: null,
      updatedAt: "2026-06-01",
      pageType: "richtext",
    },
    {
      id: "page-2",
      code: "intro_charter",
      title: "学会章程",
      content: "<p>第一章 总则……</p>",
      status: "published",
      branchId: null,
      updatedAt: "2026-05-15",
      pageType: "richtext",
    },
    {
      id: "page-party-org",
      code: "party_organizations",
      title: "党群机构",
      content: "<p>学会党群组织体系包括党群工作处、党支部委员会、工会、共青团委员会……</p>",
      status: "published",
      branchId: null,
      updatedAt: "2026-05-10",
      pageType: "party",
    },
    {
      id: "page-3",
      code: "branch_overview",
      title: "分会概况",
      content: "<p>本分会在古植物学领域开展学术活动……</p>",
      status: "published",
      branchId: "gzwxfh",
      updatedAt: "2026-04-20",
      pageType: "branch",
    },
  ],
  personnel: [
    {
      id: "person-1",
      name: "戎嘉余",
      title: "名誉理事长",
      group: "现任领导",
      bio: "中国科学院院士，古生物学家。",
      photoUrl: "",
      sort: 1,
      branchId: null,
    },
    {
      id: "person-2",
      name: "朱敏",
      title: "理事长",
      group: "现任领导",
      bio: "中国科学院古脊椎动物与古人类研究所研究员。",
      photoUrl: "",
      sort: 2,
      branchId: null,
    },
  ],
  galleryPhotos: [
    {
      id: "gal-1",
      title: "1950年代野外考察",
      category: "早期风采",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB-5UFr7wRFX7bCPr3VibXOHMw3e8uUVrVmPFzOCBdoRlyL3NPNHbAJIVZSj4y-MeIkd4GUV0XaYScTAMWf_iehw2NL0qB3tkVYY6M-BMrIQDb6FjmNxGDjPoDIg65rYIGEyaoluRwfAF0Y8BR6IZRReFnJbM8aUWlq1gbA3W2A0snXBXXdzOfZh3Re1XjXgTY5HVg0PmrDvUYPBY0hlR1FrqiAX7yIKslZLte1jow11NpNYMfMDohzZf9BgT6cwHqUDRf0DcdG303Z",
      sort: 1,
      branchId: null,
    },
    {
      id: "gal-2",
      title: "国际古生物学大会合影",
      category: "国际交流",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDEvYlo35Mb6q9OEif5aa6iUiP_oq9priQhtcpe-0yjuaIob_LuMN0Qk_l-TGY8-vJxDv_JPbtsodY4OMnqv0GM3mpkoO_sw9xrFv8cEYcFcs3j2HI20DqGKdvyUWajysaqIpyQ4EoO7V5NZrCLude6NvtkKHx-9bZTZfsj2QCuo7cQ3_CcV2uTZVLvN2uDbwMaUEd0-3G9cmM-amGpmFxDrkYsPf1woZ7tEO3cXVENfjl3yY5jfnSHA7R7t6LBj6DqNqQ0tW-RrXzH",
      sort: 2,
      branchId: null,
    },
  ],
  awards: [
    {
      id: "award-1",
      year: "2025",
      awardName: "中国古生物学会青年科学家奖",
      winner: "张三",
      description: "在寒武纪早期生命演化研究方面取得突出成果。",
      branchId: null,
    },
    {
      id: "award-2",
      year: "2024",
      awardName: "微体古生物学优秀论文奖",
      winner: "李四",
      description: "发表于《Palaeoworld》的代表性成果。",
      branchId: "wtxfh",
    },
  ],
  scienceItems: [
    {
      id: "sci-1",
      title: "化石保护：公众如何参与",
      format: "article",
      category: "科普文章",
      summary: "介绍化石保护法规与公众参与途径。",
      content: "<p>化石是不可再生的自然资源……</p>",
      externalUrl: "",
      status: "published",
      branchId: null,
      publishDate: "2026-04-10",
    },
    {
      id: "sci-2",
      title: "南京汤山地质博物馆科普基地",
      format: "base",
      category: "科普基地",
      summary: "学会共建科普教育基地介绍。",
      content: "<p>基地位于南京市……</p>",
      externalUrl: "",
      status: "published",
      branchId: null,
      publishDate: "2026-03-20",
    },
    {
      id: "sci-wtxfh",
      title: "微体化石鉴定入门（视频）",
      format: "video",
      category: "科普视频",
      summary: "分会科普视频示例。",
      content: "<p>嵌入代码：<iframe …></iframe></p>",
      externalUrl: "https://example.com/video",
      status: "published",
      branchId: "wtxfh",
      publishDate: "2026-05-01",
    },
  ],
  internationalItems: [
    {
      id: "intl-1",
      title: "中国古生物学家参与 IPC5 国际会议",
      type: "conference",
      summary: "学会代表团赴海外参加第五届国际古生物学大会。",
      content: "<p>会议期间……</p>",
      linkUrl: "",
      logoUrl: "",
      status: "published",
      publishDate: "2026-02-15",
    },
    {
      id: "intl-2",
      title: "Paleontological Society (USA)",
      type: "partner",
      summary: "合作机构展示。",
      content: "",
      linkUrl: "https://www.paleosoc.org",
      logoUrl: "/media/partner-logo.png",
      status: "published",
      publishDate: "2026-01-01",
    },
  ],
  techRewardItems: [
    {
      id: "tech-1",
      title: "中国古生物学会科学技术奖简介",
      type: "intro",
      content: "<p>科学技术奖设立宗旨与奖项设置……</p>",
      status: "published",
      updatedAt: "2026-05-01",
    },
    {
      id: "tech-2",
      title: "2026年度科学技术奖申报指南",
      type: "guide",
      content: "<p>申报条件、材料要求与截止时间……</p>",
      status: "published",
      updatedAt: "2026-05-15",
    },
  ],
  partyArticles: [
    {
      id: "party-1",
      column: "party_announcement",
      title: "关于认真学习贯彻习近平总书记在两院院士大会上重要讲话精神的通知",
      category: "重要批示",
      summary: "学会党委发布学习贯彻通知。",
      content: "<p>请各党支部认真组织学习……</p>",
      status: "published",
      pinned: true,
      publishDate: "2026-05-28",
    },
    {
      id: "party-2",
      column: "party_dynamics",
      title: "学会党委开展主题党日活动",
      category: "党建活动",
      summary: "赴红色教育基地参观学习。",
      content: "<p>活动纪实……</p>",
      status: "published",
      pinned: false,
      publishDate: "2026-05-10",
    },
    {
      id: "party-3",
      column: "party_activities",
      title: "2026年第一季度「三会一课」开展情况",
      category: "三会一课",
      summary: "各支部组织生活开展情况通报。",
      content: "<p>详情如下……</p>",
      status: "published",
      pinned: false,
      publishDate: "2026-04-30",
    },
  ],
  partyTopics: [
    {
      id: "topic-1",
      title: "党纪学习教育专题",
      description: "2026年阶段性专题，归集相关文章与成果。",
      coverUrl: "",
      articleIds: ["party-1", "party-2"],
      status: "published",
    },
  ],
  downloadFiles: [
    {
      id: "dl-1",
      title: "中国古生物学会会员登记表",
      category: "会员表格",
      fileName: "membership-form.docx",
      fileUrl: "/downloads/membership-form.docx",
      memberOnly: false,
      branchId: null,
      scope: "society",
    },
    {
      id: "dl-party-1",
      title: "入党申请书模板",
      category: "入党申请书",
      fileName: "party-application.doc",
      fileUrl: "/downloads/party-application.doc",
      memberOnly: false,
      branchId: null,
      scope: "party",
    },
    {
      id: "dl-wtxfh",
      title: "微体学分会会议简讯",
      category: "会议简讯",
      fileName: "wtxfh-newsletter.pdf",
      fileUrl: "/downloads/wtxfh-newsletter.pdf",
      memberOnly: true,
      branchId: "wtxfh",
      scope: "branch",
    },
  ],
  timelineNodes: [
    {
      id: "tl-1",
      year: "1929",
      title: "学会成立",
      description: "中国古生物学会在北京成立。",
      imageUrl: "",
      sort: 1,
      branchId: null,
    },
    {
      id: "tl-2",
      year: "1950",
      title: "学术活动恢复",
      description: "新中国成立后学会恢复学术活动。",
      imageUrl: "",
      sort: 2,
      branchId: null,
    },
  ],
  media: [
    {
      id: "media-1",
      name: "homepage-banner.jpg",
      type: "image",
      category: "首页",
      url: "/media/homepage-banner.jpg",
      sizeLabel: "1.2 MB",
      uploadedAt: "2026-06-01",
      refCount: 2,
    },
    {
      id: "media-2",
      name: "science-award-notice.pdf",
      type: "document",
      category: "公告附件",
      url: "/media/science-award-notice.pdf",
      sizeLabel: "856 KB",
      uploadedAt: "2026-05-28",
      refCount: 1,
    },
  ],
  siteConfig: {
    copyright: "© 2026 中国古生物学会 版权所有",
    contactPhone: "010-XXXXXXXX",
    contactEmail: "office@paleo.cn",
    address: "北京市西城区XXXX号",
    friendLinks: [
      { name: "中国科协", url: "https://www.cast.org.cn" },
      { name: "国家自然科学基金委员会", url: "https://www.nsfc.gov.cn" },
    ],
    quickLinks: [
      { id: "ql-1", label: "会员注册", path: "/services", icon: "person_add", sort: 1, enabled: true },
      { id: "ql-2", label: "会费缴纳", path: "/services", icon: "payments", sort: 2, enabled: true },
      { id: "ql-3", label: "会议报名", path: "/services", icon: "event", sort: 3, enabled: true },
    ],
  },
};

function migrateArticle(raw: Partial<CmsArticle>): CmsArticle {
  return {
    ...raw,
    attachments: raw.attachments ?? [],
    showOnHomepage: raw.showOnHomepage ?? false,
  } as CmsArticle;
}

function migratePage(raw: Partial<CmsPage>): CmsPage {
  return {
    pageType: "richtext",
    ...raw,
    pageType: raw.pageType ?? "richtext",
  } as CmsPage;
}

function migrateMedia(raw: Partial<CmsMediaItem>): CmsMediaItem {
  return {
    category: "未分类",
    ...raw,
    category: raw.category ?? "未分类",
  } as CmsMediaItem;
}

function migrateSiteConfig(raw: Partial<CmsSiteConfig> | undefined): CmsSiteConfig {
  const base = DEFAULT_CMS.siteConfig;
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    friendLinks: raw.friendLinks ?? base.friendLinks,
    quickLinks: raw.quickLinks ?? base.quickLinks,
  };
}

export function migrateCmsDatabase(raw: Partial<CmsDatabase>): CmsDatabase {
  return {
    banners: raw.banners ?? DEFAULT_CMS.banners,
    news: (raw.news ?? DEFAULT_CMS.news).map(migrateArticle),
    announcements: (raw.announcements ?? DEFAULT_CMS.announcements).map(migrateArticle),
    pages: (raw.pages ?? DEFAULT_CMS.pages).map(migratePage),
    personnel: raw.personnel ?? DEFAULT_CMS.personnel,
    galleryPhotos: raw.galleryPhotos ?? DEFAULT_CMS.galleryPhotos,
    awards: raw.awards ?? DEFAULT_CMS.awards,
    scienceItems: raw.scienceItems ?? DEFAULT_CMS.scienceItems,
    internationalItems: raw.internationalItems ?? DEFAULT_CMS.internationalItems,
    techRewardItems: raw.techRewardItems ?? DEFAULT_CMS.techRewardItems,
    partyArticles: raw.partyArticles ?? DEFAULT_CMS.partyArticles,
    partyTopics: raw.partyTopics ?? DEFAULT_CMS.partyTopics,
    downloadFiles: raw.downloadFiles ?? DEFAULT_CMS.downloadFiles,
    timelineNodes: raw.timelineNodes ?? DEFAULT_CMS.timelineNodes,
    media: (raw.media ?? DEFAULT_CMS.media).map(migrateMedia),
    siteConfig: migrateSiteConfig(raw.siteConfig),
  };
}

export function loadCmsDatabase(): CmsDatabase {
  const version = localStorage.getItem(`${CMS_STORAGE_KEY}_version`);
  const stored = localStorage.getItem(CMS_STORAGE_KEY);
  if (!stored || version !== String(CMS_SCHEMA_VERSION)) {
    const db = structuredClone(DEFAULT_CMS);
    saveCmsDatabase(db);
    localStorage.setItem(`${CMS_STORAGE_KEY}_version`, String(CMS_SCHEMA_VERSION));
    return db;
  }
  try {
    return migrateCmsDatabase(JSON.parse(stored) as Partial<CmsDatabase>);
  } catch {
    return structuredClone(DEFAULT_CMS);
  }
}

export function saveCmsDatabase(db: CmsDatabase): void {
  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(db));
  localStorage.setItem("paleo_cms_db", JSON.stringify(db));
  localStorage.setItem(`${CMS_STORAGE_KEY}_version`, String(CMS_SCHEMA_VERSION));
}

export function generateCmsId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export const CMS_STATUS_LABELS: Record<CmsContentStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已下架",
};
