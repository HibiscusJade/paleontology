import { useCallback, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useAdmin } from "@/contexts/AdminContext";
import { ALL_SOCIETY_UNITS } from "@shared/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Info } from "lucide-react";
import {
  type CmsArticle, type CmsBanner, type CmsDatabase, type CmsPage, type CmsPerson,
  type CmsGalleryPhoto, type CmsAward, type CmsScienceItem, type CmsInternationalItem,
  type CmsTechRewardItem, type CmsPartyArticle, type CmsPartyTopic, type CmsDownloadFile,
  type CmsTimelineNode, type CmsMediaItem,
  CMS_STATUS_LABELS,
  GALLERY_CATEGORIES, SCIENCE_CATEGORIES, DOWNLOAD_CATEGORIES_SOCIETY,
  generateCmsId, loadCmsDatabase, saveCmsDatabase,
} from "./cms-data";
import { CMS_SECTION_META, CMS_SECTIONS, PARTY_NAV_ITEMS } from "./cms-nav";
import {
  scopeLabel, statusBadgeClass, RichTextEditor, DeleteButton, ArticleSection,
  SortButtons, MemberOnlyBadge, ImageUploadField, AttachmentEditor,
} from "./cms-ui";

type CmsSection = (typeof CMS_SECTIONS)[number];

export default function ContentManagement() {
  const [, params] = useRoute("/admin/cms/:section");
  const { adminRole, adminBranchId, canAccess } = useAdmin();
  const isBranchScope = adminRole === "branch_admin" && !!adminBranchId;

  const rawSection = params?.section || "";
  const section = ((): CmsSection => {
    if (CMS_SECTIONS.includes(rawSection) && canAccess(`/admin/cms/${rawSection}`)) {
      return rawSection as CmsSection;
    }
    return adminRole === "branch_admin" ? "branch" : "banners";
  })();

  const [db, setDb] = useState<CmsDatabase>(() => loadCmsDatabase());
  const [previewArticle, setPreviewArticle] = useState<CmsArticle | null>(null);
  const [editBanner, setEditBanner] = useState<CmsBanner | null>(null);
  const [editArticle, setEditArticle] = useState<{ kind: "news" | "announcements"; item: CmsArticle | null } | null>(null);
  const [editPage, setEditPage] = useState<CmsPage | null>(null);
  const [editPerson, setEditPerson] = useState<CmsPerson | null>(null);
  const [editGallery, setEditGallery] = useState<CmsGalleryPhoto | null>(null);
  const [editAward, setEditAward] = useState<CmsAward | null>(null);
  const [editScience, setEditScience] = useState<CmsScienceItem | null>(null);
  const [editIntl, setEditIntl] = useState<CmsInternationalItem | null>(null);
  const [editTech, setEditTech] = useState<CmsTechRewardItem | null>(null);
  const [editParty, setEditParty] = useState<CmsPartyArticle | null>(null);
  const [editTopic, setEditTopic] = useState<CmsPartyTopic | null>(null);
  const [editDownload, setEditDownload] = useState<CmsDownloadFile | null>(null);
  const [editTimeline, setEditTimeline] = useState<CmsTimelineNode | null>(null);
  const [partyColumnFilter, setPartyColumnFilter] = useState<string>("all");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaCategory, setMediaCategory] = useState("all");

  const persist = useCallback((next: CmsDatabase) => {
    setDb(next);
    saveCmsDatabase(next);
  }, []);

  const matchesScope = useCallback(
    (branchId: string | null) => !isBranchScope || branchId === adminBranchId,
    [isBranchScope, adminBranchId]
  );

  const scoped = {
    banners: useMemo(() => db.banners.filter(b => matchesScope(b.branchId)).sort((a, b) => a.sort - b.sort), [db.banners, matchesScope]),
    news: useMemo(() => db.news.filter(a => matchesScope(a.branchId)), [db.news, matchesScope]),
    announcements: useMemo(() => db.announcements.filter(a => matchesScope(a.branchId)), [db.announcements, matchesScope]),
    pages: useMemo(() => db.pages.filter(p => matchesScope(p.branchId)), [db.pages, matchesScope]),
    personnel: useMemo(() => db.personnel.filter(p => matchesScope(p.branchId)), [db.personnel, matchesScope]),
    gallery: useMemo(() => db.galleryPhotos.filter(g => matchesScope(g.branchId)).sort((a, b) => a.sort - b.sort), [db.galleryPhotos, matchesScope]),
    awards: useMemo(() => db.awards.filter(a => matchesScope(a.branchId)), [db.awards, matchesScope]),
    science: useMemo(() => db.scienceItems.filter(s => matchesScope(s.branchId)), [db.scienceItems, matchesScope]),
    downloads: useMemo(() => db.downloadFiles.filter(d => matchesScope(d.branchId)), [db.downloadFiles, matchesScope]),
    timeline: useMemo(() => db.timelineNodes.filter(t => matchesScope(t.branchId)).sort((a, b) => a.sort - b.sort), [db.timelineNodes, matchesScope]),
  };

  const partyArticles = useMemo(() => {
    let list = db.partyArticles;
    if (partyColumnFilter !== "all") list = list.filter(a => a.column === partyColumnFilter);
    return list;
  }, [db.partyArticles, partyColumnFilter]);

  const regulationPages = useMemo(
    () => scoped.pages.filter(p => !p.branchId && (p.code.includes("regulation") || p.code.includes("charter"))),
    [scoped.pages]
  );

  const branchPages = useMemo(
    () => scoped.pages.filter(p => p.branchId),
    [scoped.pages]
  );

  const filteredMedia = useMemo(() => {
    return db.media.filter(m => {
      if (mediaCategory !== "all" && m.category !== mediaCategory) return false;
      if (mediaSearch && !m.name.toLowerCase().includes(mediaSearch.toLowerCase())) return false;
      return true;
    });
  }, [db.media, mediaSearch, mediaCategory]);

  const pageMeta = CMS_SECTION_META[section] ?? CMS_SECTION_META.banners;

  const articleOps = (kind: "news" | "announcements") => ({
    onTogglePin: (id: string) => {
      persist({ ...db, [kind]: db[kind].map(a => (a.id === id ? { ...a, pinned: !a.pinned } : a)) });
      toast.success("置顶状态已更新");
    },
    onPublish: (id: string) => {
      persist({ ...db, [kind]: db[kind].map(a => (a.id === id ? { ...a, status: "published" as const } : a)) });
      toast.success("已发布");
    },
    onArchive: (id: string) => {
      persist({ ...db, [kind]: db[kind].map(a => (a.id === id ? { ...a, status: "archived" as const } : a)) });
      toast.success("已下架");
    },
    onDelete: (id: string) => {
      persist({ ...db, [kind]: db[kind].filter(a => a.id !== id) });
      toast.success("已删除");
    },
  });

  const moveBanner = (id: string, dir: -1 | 1) => {
    const list = [...scoped.banners];
    const idx = list.findIndex(b => b.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    const all = [...db.banners];
    const a = all.findIndex(b => b.id === list[idx].id);
    const b = all.findIndex(x => x.id === list[swap].id);
    const sortA = all[a].sort;
    all[a] = { ...all[a], sort: all[b].sort };
    all[b] = { ...all[b], sort: sortA };
    persist({ ...db, banners: all });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-strata-blue-deep">{pageMeta.title}</h1>
        <p className="text-muted-foreground mt-1">{pageMeta.subtitle}</p>
      </div>

      {isBranchScope && (
        <Card className="border-accent-gold/40 bg-accent-gold/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-strata-blue-deep">{ALL_SOCIETY_UNITS[adminBranchId!]}</p>
              <p className="text-muted-foreground mt-1">当前仅显示并编辑本分会的相关内容。</p>
            </div>
          </CardContent>
        </Card>
      )}

      {section === "banners" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">轮播图列表</CardTitle>
                <CardDescription>支持排序、上传图片与设置跳转链接</CardDescription>
              </div>
              <Button size="sm" onClick={() => setEditBanner({ id: generateCmsId("banner"), title: "", imageUrl: "", linkUrl: "/", sort: scoped.banners.length + 1, branchId: isBranchScope ? adminBranchId! : null, enabled: true })}>
                <Plus className="h-3.5 w-3.5 mr-1" /> 新增
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排序</TableHead><TableHead>标题</TableHead><TableHead>归属</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.banners.map((b, i) => (
                    <TableRow key={b.id}>
                      <TableCell><div className="flex items-center gap-1">{b.sort}<SortButtons onUp={() => moveBanner(b.id, -1)} onDown={() => moveBanner(b.id, 1)} /></div></TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{b.title}</TableCell>
                      <TableCell>{scopeLabel(b.branchId)}</TableCell>
                      <TableCell><Badge variant="outline" className={b.enabled ? "text-green-700 border-green-300 bg-green-50" : ""}>{b.enabled ? "启用" : "停用"}</Badge></TableCell>
                      <TableCell className="text-right flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => setEditBanner({ ...b })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={b.title} onConfirm={() => { persist({ ...db, banners: db.banners.filter(x => x.id !== b.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "news" && (
          <ArticleSection title="新闻列表" description="学会要闻与工作动态" items={scoped.news}
            onAdd={() => setEditArticle({ kind: "news", item: { id: generateCmsId("news"), title: "", category: "学会要闻", summary: "", content: "<p></p>", status: "draft", pinned: false, publishDate: new Date().toISOString().split("T")[0], branchId: isBranchScope ? adminBranchId! : null, scope: isBranchScope ? "branch" : "society", attachments: [], showOnHomepage: false } })}
            onEdit={i => setEditArticle({ kind: "news", item: { ...i } })} onPreview={setPreviewArticle} {...articleOps("news")} />
      )}

      {section === "announcements" && (
          <ArticleSection title="公告列表" description="发布与维护会员公告，可设置首页展示与附件下载权限" items={scoped.announcements}
            onAdd={() => setEditArticle({ kind: "announcements", item: { id: generateCmsId("ann"), title: "", category: "组织工作", summary: "", content: "<p></p>", status: "draft", pinned: false, publishDate: new Date().toISOString().split("T")[0], branchId: isBranchScope ? adminBranchId! : null, scope: isBranchScope ? "branch" : "society", attachments: [], showOnHomepage: isBranchScope } })}
            onEdit={i => setEditArticle({ kind: "announcements", item: { ...i } })} onPreview={setPreviewArticle} {...articleOps("announcements")} />
      )}

      {section === "party" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">栏目内容</CardTitle>
              <CardDescription>与前台党建文化各子栏目对应</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 items-center">
              <Label className="text-sm">栏目筛选</Label>
              <Select value={partyColumnFilter} onValueChange={setPartyColumnFilter}>
                <SelectTrigger className="w-[200px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部栏目</SelectItem>
                  {PARTY_NAV_ITEMS.filter(c => c.code !== "party_topics" && c.code !== "party_downloads").map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="ml-auto" onClick={() => setEditParty({ id: generateCmsId("party"), column: partyColumnFilter === "all" ? "party_announcement" : partyColumnFilter, title: "", category: "", summary: "", content: "<p></p>", status: "draft", pinned: false, publishDate: new Date().toISOString().split("T")[0] })}>
                <Plus className="h-3.5 w-3.5 mr-1" /> 新建文章
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader><TableRow><TableHead>栏目</TableHead><TableHead>标题</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {partyArticles.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs">{PARTY_NAV_ITEMS.find(c => c.code === a.column)?.title || a.column}</TableCell>
                      <TableCell className="font-medium max-w-[220px] truncate">{a.title}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(a.status)}>{CMS_STATUS_LABELS[a.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditParty({ ...a })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={a.title} onConfirm={() => { persist({ ...db, partyArticles: db.partyArticles.filter(x => x.id !== a.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">党建专题</CardTitle><CardDescription>创建专题并归集相关文章</CardDescription></div>
              <Button size="sm" onClick={() => setEditTopic({ id: generateCmsId("topic"), title: "", description: "", coverUrl: "", articleIds: [], status: "draft" })}><Plus className="h-3.5 w-3.5 mr-1" /> 新建专题</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>专题名称</TableHead><TableHead>文章数</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {db.partyTopics.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.articleIds.length}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(t.status)}>{CMS_STATUS_LABELS[t.status]}</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setEditTopic({ ...t })}><Edit className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {section === "pages" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">页面列表</CardTitle><CardDescription>学会概况、章程及党建相关富文本页</CardDescription></div>
              <Button size="sm" onClick={() => setEditPage({ id: generateCmsId("page"), code: "", title: "", content: "<p></p>", status: "draft", branchId: isBranchScope ? adminBranchId! : null, updatedAt: new Date().toISOString().split("T")[0], pageType: isBranchScope ? "branch" : "richtext" })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>编码</TableHead><TableHead>类型</TableHead><TableHead>归属</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.pages.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="text-xs font-mono">{p.code}</TableCell>
                      <TableCell className="text-xs">{p.pageType === "party" ? "党建" : p.pageType === "branch" ? "分会" : "学会"}</TableCell>
                      <TableCell>{scopeLabel(p.branchId)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{CMS_STATUS_LABELS[p.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditPage({ ...p })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={p.title} onConfirm={() => { persist({ ...db, pages: db.pages.filter(x => x.id !== p.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "personnel" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">人员列表</CardTitle><CardDescription>领导、理事会、监事会与秘书处成员</CardDescription></div>
              <Button size="sm" onClick={() => setEditPerson({ id: generateCmsId("person"), name: "", title: "", group: "现任领导", bio: "", photoUrl: "", sort: scoped.personnel.length + 1, branchId: isBranchScope ? adminBranchId! : null })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>姓名</TableHead><TableHead>职务</TableHead><TableHead>分组</TableHead><TableHead>照片</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.personnel.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{p.group}</TableCell>
                      <TableCell>{p.photoUrl ? "已上传" : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditPerson({ ...p })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={p.name} onConfirm={() => { persist({ ...db, personnel: db.personnel.filter(x => x.id !== p.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "gallery" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">相册照片</CardTitle><CardDescription>按分类上传与管理历史照片</CardDescription></div>
              <Button size="sm" onClick={() => setEditGallery({ id: generateCmsId("gal"), title: "", category: GALLERY_CATEGORIES[0], imageUrl: "", sort: scoped.gallery.length + 1, branchId: isBranchScope ? adminBranchId! : null })}><Plus className="h-3.5 w-3.5 mr-1" /> 上传照片</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scoped.gallery.map(g => (
                  <div key={g.id} className="border rounded-lg overflow-hidden group relative">
                    {g.imageUrl && <img src={g.imageUrl} alt={g.title} className="w-full h-32 object-cover" />}
                    <div className="p-2 text-xs">
                      <p className="font-medium truncate">{g.title}</p>
                      <p className="text-muted-foreground">{g.category}</p>
                    </div>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5">
                      <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => setEditGallery({ ...g })}><Edit className="h-3 w-3" /></Button>
                      <DeleteButton title={g.title} onConfirm={() => { persist({ ...db, galleryPhotos: db.galleryPhotos.filter(x => x.id !== g.id) }); toast.success("已删除"); }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      )}

      {section === "awards" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">获奖记录</CardTitle></div>
              <Button size="sm" onClick={() => setEditAward({ id: generateCmsId("award"), year: new Date().getFullYear().toString(), awardName: "", winner: "", description: "", branchId: isBranchScope ? adminBranchId! : null })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>年份</TableHead><TableHead>奖项</TableHead><TableHead>获奖人</TableHead><TableHead>归属</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.awards.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.year}</TableCell>
                      <TableCell className="font-medium">{a.awardName}</TableCell>
                      <TableCell>{a.winner}</TableCell>
                      <TableCell>{scopeLabel(a.branchId)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditAward({ ...a })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={a.awardName} onConfirm={() => { persist({ ...db, awards: db.awards.filter(x => x.id !== a.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "science" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">内容列表</CardTitle><CardDescription>科普文章、视频、基地、专著与化石保护</CardDescription></div>
              <Button size="sm" onClick={() => setEditScience({ id: generateCmsId("sci"), title: "", format: "article", category: SCIENCE_CATEGORIES[0], summary: "", content: "<p></p>", externalUrl: "", status: "draft", branchId: isBranchScope ? adminBranchId! : null, publishDate: new Date().toISOString().split("T")[0] })}><Plus className="h-3.5 w-3.5 mr-1" /> 新建</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>格式</TableHead><TableHead>分类</TableHead><TableHead>归属</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.science.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{s.title}</TableCell>
                      <TableCell className="text-xs">{s.format}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell>{scopeLabel(s.branchId)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(s.status)}>{CMS_STATUS_LABELS[s.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditScience({ ...s })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={s.title} onConfirm={() => { persist({ ...db, scienceItems: db.scienceItems.filter(x => x.id !== s.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "international" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">内容列表</CardTitle><CardDescription>交流动态、国际会议与合作机构</CardDescription></div>
              <Button size="sm" onClick={() => setEditIntl({ id: generateCmsId("intl"), title: "", type: "news", summary: "", content: "<p></p>", linkUrl: "", logoUrl: "", status: "draft", publishDate: new Date().toISOString().split("T")[0] })}><Plus className="h-3.5 w-3.5 mr-1" /> 新建</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {db.internationalItems.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.title}</TableCell>
                      <TableCell>{i.type === "news" ? "交流动态" : i.type === "conference" ? "国际会议" : "合作机构"}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(i.status)}>{CMS_STATUS_LABELS[i.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditIntl({ ...i })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={i.title} onConfirm={() => { persist({ ...db, internationalItems: db.internationalItems.filter(x => x.id !== i.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "tech-rewards" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">内容列表</CardTitle><CardDescription>奖项介绍与申报指南</CardDescription></div>
              <Button size="sm" onClick={() => setEditTech({ id: generateCmsId("tech"), title: "", type: "guide", content: "<p></p>", status: "draft", updatedAt: new Date().toISOString().split("T")[0] })}><Plus className="h-3.5 w-3.5 mr-1" /> 新建</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {db.techRewardItems.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.type === "intro" ? "奖项介绍" : "申报指南"}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(t.status)}>{CMS_STATUS_LABELS[t.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditTech({ ...t })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={t.title} onConfirm={() => { persist({ ...db, techRewardItems: db.techRewardItems.filter(x => x.id !== t.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

        {/* Timeline */}
      {section === "timeline" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">学会沿革（时间线）</CardTitle><CardDescription>年份节点编辑</CardDescription></div>
              <Button size="sm" onClick={() => setEditTimeline({ id: generateCmsId("tl"), year: "", title: "", description: "", imageUrl: "", sort: scoped.timeline.length + 1, branchId: null })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增节点</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>年份</TableHead><TableHead>事件</TableHead><TableHead>描述</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.timeline.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-bold">{t.year}</TableCell>
                      <TableCell>{t.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{t.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditTimeline({ ...t })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={t.title} onConfirm={() => { persist({ ...db, timelineNodes: db.timelineNodes.filter(x => x.id !== t.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "downloads" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">文件列表</CardTitle><CardDescription>上传资料文件，可限制仅有效会员下载</CardDescription></div>
              <Button size="sm" onClick={() => setEditDownload({ id: generateCmsId("dl"), title: "", category: isBranchScope ? "会议简讯" : DOWNLOAD_CATEGORIES_SOCIETY[0], fileName: "", fileUrl: "", memberOnly: false, branchId: isBranchScope ? adminBranchId! : null, scope: isBranchScope ? "branch" : "society" })}><Plus className="h-3.5 w-3.5 mr-1" /> 上传文件</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>分类</TableHead><TableHead>范围</TableHead><TableHead>权限</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scoped.downloads.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell>{d.category}</TableCell>
                      <TableCell>{d.scope === "party" ? "党建" : scopeLabel(d.branchId)}</TableCell>
                      <TableCell><MemberOnlyBadge memberOnly={d.memberOnly} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditDownload({ ...d })}><Edit className="h-3.5 w-3.5" /></Button>
                        <DeleteButton title={d.title} onConfirm={() => { persist({ ...db, downloadFiles: db.downloadFiles.filter(x => x.id !== d.id) }); toast.success("已删除"); }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

        {/* M3 4.3 Media */}
      {section === "media" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">媒体文件</CardTitle>
              <CardDescription>分类、搜索与上传；已被引用的文件不可删除</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Input placeholder="搜索文件名…" className="max-w-xs" value={mediaSearch} onChange={e => setMediaSearch(e.target.value)} />
                <Select value={mediaCategory} onValueChange={setMediaCategory}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="分类" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {[...new Set(db.media.map(m => m.category))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="file" className="max-w-[200px] text-xs" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const item: CmsMediaItem = { id: generateCmsId("media"), name: file.name, type: file.type.startsWith("image/") ? "image" : "document", category: "未分类", url: reader.result as string, sizeLabel: `${Math.round(file.size / 1024)} KB`, uploadedAt: new Date().toISOString().split("T")[0], refCount: 0 };
                    persist({ ...db, media: [...db.media, item] });
                    toast.success("已上传到媒体库");
                  };
                  reader.readAsDataURL(file);
                }} />
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>文件名</TableHead><TableHead>分类</TableHead><TableHead>引用</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredMedia.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.category}</TableCell>
                      <TableCell>{m.refCount} 处</TableCell>
                      <TableCell className="text-right">
                        {m.refCount > 0 ? (
                          <span className="text-xs text-muted-foreground mr-2">被引用，不可删</span>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { persist({ ...db, media: db.media.filter(x => x.id !== m.id) }); toast.success("已删除"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "settings" && (
        isBranchScope ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">站点全局配置仅学会总管理员可编辑</CardContent></Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">底部信息</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                  {(["copyright", "contactPhone", "contactEmail", "address"] as const).map(key => (
                    <div key={key} className="space-y-2">
                      <Label>{key === "copyright" ? "版权" : key === "contactPhone" ? "电话" : key === "contactEmail" ? "邮箱" : "地址"}</Label>
                      <Input value={db.siteConfig[key]} onChange={e => persist({ ...db, siteConfig: { ...db.siteConfig, [key]: e.target.value } })} />
                    </div>
                  ))}
                  <Label>友情链接</Label>
                  {db.siteConfig.friendLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={link.name} onChange={e => { const friendLinks = [...db.siteConfig.friendLinks]; friendLinks[idx] = { ...link, name: e.target.value }; persist({ ...db, siteConfig: { ...db.siteConfig, friendLinks } }); }} />
                      <Input value={link.url} onChange={e => { const friendLinks = [...db.siteConfig.friendLinks]; friendLinks[idx] = { ...link, url: e.target.value }; persist({ ...db, siteConfig: { ...db.siteConfig, friendLinks } }); }} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">首页快捷入口</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>标签</TableHead><TableHead>路径</TableHead><TableHead>启用</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {db.siteConfig.quickLinks.sort((a, b) => a.sort - b.sort).map(ql => (
                        <TableRow key={ql.id}>
                          <TableCell><Input className="h-8" value={ql.label} onChange={e => persist({ ...db, siteConfig: { ...db.siteConfig, quickLinks: db.siteConfig.quickLinks.map(x => x.id === ql.id ? { ...x, label: e.target.value } : x) } })} /></TableCell>
                          <TableCell><Input className="h-8" value={ql.path} onChange={e => persist({ ...db, siteConfig: { ...db.siteConfig, quickLinks: db.siteConfig.quickLinks.map(x => x.id === ql.id ? { ...x, path: e.target.value } : x) } })} /></TableCell>
                          <TableCell><Checkbox checked={ql.enabled} onCheckedChange={v => persist({ ...db, siteConfig: { ...db.siteConfig, quickLinks: db.siteConfig.quickLinks.map(x => x.id === ql.id ? { ...x, enabled: !!v } : x) } })} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button className="mt-4" onClick={() => toast.success("站点配置已保存")}>保存全部配置</Button>
                </CardContent>
              </Card>
            </div>
          )
      )}

      {section === "regulations" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">条例列表</CardTitle><CardDescription>编辑规章条例正文，可在页面内容中维护附件</CardDescription></div>
              <Button size="sm" onClick={() => setEditPage({ id: generateCmsId("page"), code: "regulations_new", title: "", content: "<p></p>", status: "draft", branchId: null, updatedAt: new Date().toISOString().split("T")[0], pageType: "richtext" })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>编码</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {regulationPages.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="text-xs font-mono">{p.code}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{CMS_STATUS_LABELS[p.status]}</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setEditPage({ ...p })}><Edit className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {section === "branch" && (
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div><CardTitle className="text-base">分会页面</CardTitle><CardDescription>对应前台「组织机构」中的分会子站点内容</CardDescription></div>
              <Button size="sm" onClick={() => setEditPage({ id: generateCmsId("page"), code: "branch_page", title: "", content: "<p></p>", status: "draft", branchId: isBranchScope ? adminBranchId! : null, updatedAt: new Date().toISOString().split("T")[0], pageType: "branch" })}><Plus className="h-3.5 w-3.5 mr-1" /> 新增页面</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>归属</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                <TableBody>
                  {branchPages.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{scopeLabel(p.branchId)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{CMS_STATUS_LABELS[p.status]}</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setEditPage({ ...p })}><Edit className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      {/* Dialogs — Banner */}
      <Dialog open={!!editBanner} onOpenChange={o => !o && setEditBanner(null)}>
        <DialogContent><DialogHeader><DialogTitle>编辑 Banner</DialogTitle></DialogHeader>
          {editBanner && (<div className="space-y-3">
            <div className="space-y-2"><Label>标题</Label><Input value={editBanner.title} onChange={e => setEditBanner({ ...editBanner, title: e.target.value })} /></div>
            <ImageUploadField label="轮播图片" value={editBanner.imageUrl} onChange={url => setEditBanner({ ...editBanner, imageUrl: url })} />
            <div className="space-y-2"><Label>链接</Label><Input value={editBanner.linkUrl} onChange={e => setEditBanner({ ...editBanner, linkUrl: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={editBanner.enabled} onCheckedChange={v => setEditBanner({ ...editBanner, enabled: !!v })} />启用</label>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setEditBanner(null)}>取消</Button><Button onClick={() => { if (!editBanner) return; const exists = db.banners.some(b => b.id === editBanner.id); persist({ ...db, banners: exists ? db.banners.map(b => b.id === editBanner.id ? editBanner : b) : [...db.banners, editBanner] }); setEditBanner(null); toast.success("已保存"); }}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article dialog */}
      <Dialog open={!!editArticle} onOpenChange={o => !o && setEditArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>编辑内容</DialogTitle></DialogHeader>
          {editArticle?.item && (<div className="space-y-3">
            <div className="space-y-2"><Label>标题</Label><Input value={editArticle.item.title} onChange={e => setEditArticle({ ...editArticle, item: { ...editArticle.item!, title: e.target.value } })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>分类</Label><Input value={editArticle.item.category} onChange={e => setEditArticle({ ...editArticle, item: { ...editArticle.item!, category: e.target.value } })} /></div>
              <div className="space-y-2"><Label>日期</Label><Input type="date" value={editArticle.item.publishDate} onChange={e => setEditArticle({ ...editArticle, item: { ...editArticle.item!, publishDate: e.target.value } })} /></div>
            </div>
            <div className="space-y-2"><Label>摘要</Label><Textarea rows={2} value={editArticle.item.summary} onChange={e => setEditArticle({ ...editArticle, item: { ...editArticle.item!, summary: e.target.value } })} /></div>
            <RichTextEditor value={editArticle.item.content} onChange={c => setEditArticle({ ...editArticle, item: { ...editArticle.item!, content: c } })} />
            <AttachmentEditor attachments={editArticle.item.attachments} onChange={a => setEditArticle({ ...editArticle, item: { ...editArticle.item!, attachments: a } })} />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={editArticle.item.showOnHomepage} onCheckedChange={v => setEditArticle({ ...editArticle, item: { ...editArticle.item!, showOnHomepage: !!v } })} />在首页展示</label>
          </div>)}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditArticle(null)}>取消</Button>
            <Button onClick={() => { if (!editArticle?.item) return; const k = editArticle.kind; const exists = db[k].some(a => a.id === editArticle.item!.id); persist({ ...db, [k]: exists ? db[k].map(a => a.id === editArticle.item!.id ? editArticle.item! : a) : [...db[k], editArticle.item] }); setEditArticle(null); toast.success("已保存"); }}>保存</Button>
            <Button onClick={() => { if (!editArticle?.item) return; const k = editArticle.kind; const item = { ...editArticle.item, status: "published" as const }; const exists = db[k].some(a => a.id === item.id); persist({ ...db, [k]: exists ? db[k].map(a => a.id === item.id ? item : a) : [...db[k], item] }); setEditArticle(null); toast.success("已发布"); }}>发布</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page dialog */}
      <Dialog open={!!editPage} onOpenChange={o => !o && setEditPage(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>编辑页面</DialogTitle></DialogHeader>
          {editPage && (<div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>标题</Label><Input value={editPage.title} onChange={e => setEditPage({ ...editPage, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>编码</Label><Input value={editPage.code} onChange={e => setEditPage({ ...editPage, code: e.target.value })} /></div>
            </div>
            <RichTextEditor value={editPage.content} onChange={c => setEditPage({ ...editPage, content: c })} />
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setEditPage(null)}>取消</Button><Button onClick={() => { if (!editPage) return; const page = { ...editPage, updatedAt: new Date().toISOString().split("T")[0], status: "published" as const }; persist({ ...db, pages: db.pages.some(p => p.id === page.id) ? db.pages.map(p => p.id === page.id ? page : p) : [...db.pages, page] }); setEditPage(null); toast.success("已发布"); }}>保存并发布</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Person dialog */}
      <Dialog open={!!editPerson} onOpenChange={o => !o && setEditPerson(null)}>
        <DialogContent><DialogHeader><DialogTitle>编辑人员</DialogTitle></DialogHeader>
          {editPerson && (<div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>姓名</Label><Input value={editPerson.name} onChange={e => setEditPerson({ ...editPerson, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>职务</Label><Input value={editPerson.title} onChange={e => setEditPerson({ ...editPerson, title: e.target.value })} /></div>
            </div>
            <ImageUploadField label="照片" value={editPerson.photoUrl} onChange={url => setEditPerson({ ...editPerson, photoUrl: url })} />
            <div className="space-y-2"><Label>简介</Label><Textarea rows={3} value={editPerson.bio} onChange={e => setEditPerson({ ...editPerson, bio: e.target.value })} /></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setEditPerson(null)}>取消</Button><Button onClick={() => { if (!editPerson) return; persist({ ...db, personnel: db.personnel.some(p => p.id === editPerson.id) ? db.personnel.map(p => p.id === editPerson.id ? editPerson : p) : [...db.personnel, editPerson] }); setEditPerson(null); toast.success("已保存"); }}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gallery dialog */}
      <Dialog open={!!editGallery} onOpenChange={o => !o && setEditGallery(null)}>
        <DialogContent>{editGallery && (<><DialogHeader><DialogTitle>相册照片</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>标题</Label><Input value={editGallery.title} onChange={e => setEditGallery({ ...editGallery, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>分类</Label>
              <Select value={editGallery.category} onValueChange={v => setEditGallery({ ...editGallery, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GALLERY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <ImageUploadField label="照片" value={editGallery.imageUrl} onChange={url => setEditGallery({ ...editGallery, imageUrl: url })} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditGallery(null)}>取消</Button><Button onClick={() => { persist({ ...db, galleryPhotos: db.galleryPhotos.some(g => g.id === editGallery.id) ? db.galleryPhotos.map(g => g.id === editGallery.id ? editGallery : g) : [...db.galleryPhotos, editGallery] }); setEditGallery(null); toast.success("已保存"); }}>保存</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Award dialog */}
      <Dialog open={!!editAward} onOpenChange={o => !o && setEditAward(null)}>
        <DialogContent>{editAward && (<><DialogHeader><DialogTitle>获奖成果</DialogTitle></DialogHeader>
          <div className="space-y-3 grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>年份</Label><Input value={editAward.year} onChange={e => setEditAward({ ...editAward, year: e.target.value })} /></div>
            <div className="space-y-2"><Label>获奖人</Label><Input value={editAward.winner} onChange={e => setEditAward({ ...editAward, winner: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>奖项名称</Label><Input value={editAward.awardName} onChange={e => setEditAward({ ...editAward, awardName: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>说明</Label><Textarea value={editAward.description} onChange={e => setEditAward({ ...editAward, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => { persist({ ...db, awards: db.awards.some(a => a.id === editAward.id) ? db.awards.map(a => a.id === editAward.id ? editAward : a) : [...db.awards, editAward] }); setEditAward(null); toast.success("已保存"); }}>保存</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Science dialog */}
      <Dialog open={!!editScience} onOpenChange={o => !o && setEditScience(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">{editScience && (<><DialogHeader><DialogTitle>科学传播</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={editScience.title} onChange={e => setEditScience({ ...editScience, title: e.target.value })} placeholder="标题" />
            <Select value={editScience.format} onValueChange={v => setEditScience({ ...editScience, format: v as CmsScienceItem["format"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="article">科普文章</SelectItem><SelectItem value="video">科普视频</SelectItem><SelectItem value="base">科普基地</SelectItem><SelectItem value="book">学术专著</SelectItem><SelectItem value="fossil">化石保护</SelectItem>
              </SelectContent>
            </Select>
            <RichTextEditor value={editScience.content} onChange={c => setEditScience({ ...editScience, content: c })} />
            <Input value={editScience.externalUrl} onChange={e => setEditScience({ ...editScience, externalUrl: e.target.value })} placeholder="外链/视频地址" />
          </div>
          <DialogFooter><Button onClick={() => { const item = { ...editScience, status: "published" as const }; persist({ ...db, scienceItems: db.scienceItems.some(s => s.id === item.id) ? db.scienceItems.map(s => s.id === item.id ? item : s) : [...db.scienceItems, item] }); setEditScience(null); toast.success("已发布"); }}>发布</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Intl dialog */}
      <Dialog open={!!editIntl} onOpenChange={o => !o && setEditIntl(null)}>
        <DialogContent className="max-w-2xl">{editIntl && (<><DialogHeader><DialogTitle>国际交流</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={editIntl.title} onChange={e => setEditIntl({ ...editIntl, title: e.target.value })} />
            <Select value={editIntl.type} onValueChange={v => setEditIntl({ ...editIntl, type: v as CmsInternationalItem["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="news">交流动态</SelectItem><SelectItem value="conference">国际会议</SelectItem><SelectItem value="partner">合作机构</SelectItem></SelectContent>
            </Select>
            <RichTextEditor value={editIntl.content} onChange={c => setEditIntl({ ...editIntl, content: c })} />
            <Input value={editIntl.linkUrl} onChange={e => setEditIntl({ ...editIntl, linkUrl: e.target.value })} placeholder="外链" />
            <ImageUploadField label="Logo" value={editIntl.logoUrl} onChange={url => setEditIntl({ ...editIntl, logoUrl: url })} />
          </div>
          <DialogFooter><Button onClick={() => { const item = { ...editIntl, status: "published" as const }; persist({ ...db, internationalItems: db.internationalItems.some(i => i.id === item.id) ? db.internationalItems.map(i => i.id === item.id ? item : i) : [...db.internationalItems, item] }); setEditIntl(null); toast.success("已发布"); }}>发布</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Tech dialog */}
      <Dialog open={!!editTech} onOpenChange={o => !o && setEditTech(null)}>
        <DialogContent className="max-w-2xl">{editTech && (<><DialogHeader><DialogTitle>科技奖励</DialogTitle></DialogHeader>
          <Input value={editTech.title} onChange={e => setEditTech({ ...editTech, title: e.target.value })} className="mb-3" />
          <RichTextEditor value={editTech.content} onChange={c => setEditTech({ ...editTech, content: c })} />
          <DialogFooter className="mt-4"><Button onClick={() => { const item = { ...editTech, status: "published" as const, updatedAt: new Date().toISOString().split("T")[0] }; persist({ ...db, techRewardItems: db.techRewardItems.some(t => t.id === item.id) ? db.techRewardItems.map(t => t.id === item.id ? item : t) : [...db.techRewardItems, item] }); setEditTech(null); toast.success("已发布"); }}>发布</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Party dialog */}
      <Dialog open={!!editParty} onOpenChange={o => !o && setEditParty(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">{editParty && (<><DialogHeader><DialogTitle>党建文章</DialogTitle></DialogHeader>
          <Select value={editParty.column} onValueChange={v => setEditParty({ ...editParty, column: v })}>
            <SelectTrigger className="mb-3"><SelectValue /></SelectTrigger><SelectContent>{PARTY_NAV_ITEMS.filter(c => c.code !== "party_topics" && c.code !== "party_downloads").map(c => <SelectItem key={c.code} value={c.code}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={editParty.title} onChange={e => setEditParty({ ...editParty, title: e.target.value })} className="mb-3" />
          <RichTextEditor value={editParty.content} onChange={c => setEditParty({ ...editParty, content: c })} />
          <DialogFooter className="mt-4"><Button onClick={() => { const item = { ...editParty, status: "published" as const }; persist({ ...db, partyArticles: db.partyArticles.some(a => a.id === item.id) ? db.partyArticles.map(a => a.id === item.id ? item : a) : [...db.partyArticles, item] }); setEditParty(null); toast.success("已发布"); }}>发布</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Topic dialog */}
      <Dialog open={!!editTopic} onOpenChange={o => !o && setEditTopic(null)}>
        <DialogContent>{editTopic && (<><DialogHeader><DialogTitle>党建专题</DialogTitle></DialogHeader>
          <Input value={editTopic.title} onChange={e => setEditTopic({ ...editTopic, title: e.target.value })} className="mb-2" />
          <Textarea value={editTopic.description} onChange={e => setEditTopic({ ...editTopic, description: e.target.value })} />
          <p className="text-xs text-muted-foreground mt-2">关联文章 ID：{editTopic.articleIds.join(", ") || "无"}</p>
          <DialogFooter className="mt-4"><Button onClick={() => { persist({ ...db, partyTopics: db.partyTopics.some(t => t.id === editTopic.id) ? db.partyTopics.map(t => t.id === editTopic.id ? editTopic : t) : [...db.partyTopics, editTopic] }); setEditTopic(null); toast.success("已保存"); }}>保存</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Download dialog */}
      <Dialog open={!!editDownload} onOpenChange={o => !o && setEditDownload(null)}>
        <DialogContent>{editDownload && (<><DialogHeader><DialogTitle>下载文件</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={editDownload.title} onChange={e => setEditDownload({ ...editDownload, title: e.target.value })} placeholder="显示标题" />
            <Input value={editDownload.fileName} onChange={e => setEditDownload({ ...editDownload, fileName: e.target.value })} placeholder="文件名" />
            <Input value={editDownload.fileUrl} onChange={e => setEditDownload({ ...editDownload, fileUrl: e.target.value })} placeholder="文件 URL" />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={editDownload.memberOnly} onCheckedChange={v => setEditDownload({ ...editDownload, memberOnly: !!v })} />仅有效会员可下载</label>
          </div>
          <DialogFooter><Button onClick={() => { persist({ ...db, downloadFiles: db.downloadFiles.some(d => d.id === editDownload.id) ? db.downloadFiles.map(d => d.id === editDownload.id ? editDownload : d) : [...db.downloadFiles, editDownload] }); setEditDownload(null); toast.success("已保存"); }}>保存</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Timeline dialog */}
      <Dialog open={!!editTimeline} onOpenChange={o => !o && setEditTimeline(null)}>
        <DialogContent>{editTimeline && (<><DialogHeader><DialogTitle>沿革节点</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input value={editTimeline.year} onChange={e => setEditTimeline({ ...editTimeline, year: e.target.value })} placeholder="年份" />
            <Input value={editTimeline.title} onChange={e => setEditTimeline({ ...editTimeline, title: e.target.value })} placeholder="事件标题" />
            <Textarea className="col-span-2" value={editTimeline.description} onChange={e => setEditTimeline({ ...editTimeline, description: e.target.value })} />
          </div>
          <DialogFooter className="mt-4"><Button onClick={() => { persist({ ...db, timelineNodes: db.timelineNodes.some(t => t.id === editTimeline.id) ? db.timelineNodes.map(t => t.id === editTimeline.id ? editTimeline : t) : [...db.timelineNodes, editTimeline] }); setEditTimeline(null); toast.success("已保存"); }}>保存</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <Dialog open={!!previewArticle} onOpenChange={o => !o && setPreviewArticle(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>预览</DialogTitle><DialogDescription>{previewArticle?.title}</DialogDescription></DialogHeader>
          {previewArticle && (<div className="border rounded-md p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewArticle.content }} />)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
