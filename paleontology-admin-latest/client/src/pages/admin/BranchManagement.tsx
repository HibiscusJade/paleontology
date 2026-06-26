import { useState } from "react";
import { useAdmin, type BranchRecord } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, Edit, Users, Star, BarChart3, Calendar, CreditCard } from "lucide-react";
import { ALL_SOCIETY_UNITS, TOTAL_SOCIETY_ID, TOTAL_SOCIETY_INTRO } from "@shared/constants";
import { Link } from "wouter";

// ── 总学会状态本地持久化 ─────────────────────────────────────────────────────
const TOTAL_SOCIETY_KEY = "paleo_admin_total_society_state";

interface TotalSocietyState {
  name: string;
  description: string;
  disabled: boolean;
}

function loadTotalSocietyState(): TotalSocietyState {
  try {
    const stored = localStorage.getItem(TOTAL_SOCIETY_KEY);
    if (stored) return JSON.parse(stored) as TotalSocietyState;
  } catch { /* ignore */ }
  return {
    name: ALL_SOCIETY_UNITS[TOTAL_SOCIETY_ID],
    description: TOTAL_SOCIETY_INTRO,
    disabled: false,
  };
}

function saveTotalSocietyState(state: TotalSocietyState) {
  localStorage.setItem(TOTAL_SOCIETY_KEY, JSON.stringify(state));
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function BranchManagement() {
  const {
    getAllBranches,
    updateBranch,
    toggleBranchDisabled,
    getAllMembers,
    getAllConferences,
    getGlobalStats,
  } = useAdmin();

  const branches = getAllBranches();
  const allConferences = getAllConferences();
  const globalStats = getGlobalStats();

  // 全平台聚合数据
  const totalUsers = getAllMembers().length;
  const publishedConfs = allConferences.filter(c => c.status === "published").length;
  const totalSocietyConfs = allConferences.filter(c => c.branchId === TOTAL_SOCIETY_ID).length;

  // 总学会状态（localStorage 持久化）
  const [totalSociety, setTotalSociety] = useState<TotalSocietyState>(loadTotalSocietyState);

  // 共用编辑弹窗
  const [editTarget, setEditTarget] = useState<"total" | BranchRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 共用禁用/启用确认弹窗
  const [toggleTarget, setToggleTarget] = useState<"total" | BranchRecord | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  const handleEdit = (target: "total" | BranchRecord) => {
    setEditTarget(target);
    if (target === "total") {
      setEditName(totalSociety.name);
      setEditDescription(totalSociety.description);
    } else {
      setEditName(target.name);
      setEditDescription(target.description || "");
    }
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (editTarget === "total") {
      const next: TotalSocietyState = {
        ...totalSociety,
        name: editName.trim() || totalSociety.name,
        description: editDescription.trim(),
      };
      setTotalSociety(next);
      saveTotalSocietyState(next);
    } else if (editTarget) {
      updateBranch((editTarget as BranchRecord).id, {
        name: editName.trim() || (editTarget as BranchRecord).name,
        description: editDescription.trim(),
      });
    }
    setEditOpen(false);
    setEditTarget(null);
  };

  const handleToggle = (target: "total" | BranchRecord) => {
    setToggleTarget(target);
    setToggleOpen(true);
  };

  const handleToggleConfirm = () => {
    if (toggleTarget === "total") {
      const next: TotalSocietyState = { ...totalSociety, disabled: !totalSociety.disabled };
      setTotalSociety(next);
      saveTotalSocietyState(next);
    } else if (toggleTarget) {
      toggleBranchDisabled((toggleTarget as BranchRecord).id);
    }
    setToggleOpen(false);
    setToggleTarget(null);
  };

  const toggleName = toggleTarget === "total"
    ? totalSociety.name
    : (toggleTarget as BranchRecord)?.name;
  const toggleDisabled = toggleTarget === "total"
    ? totalSociety.disabled
    : (toggleTarget as BranchRecord)?.disabled;

  return (
    <div className="space-y-6">
      {/* ── 页头 ── */}
      <div>
        <h1 className="text-2xl font-bold text-strata-blue-deep">学会/分会管理</h1>
        <p className="text-muted-foreground mt-1">
          管理中国古生物学会（总学会）及 11 个专业分会
        </p>
      </div>

      {/* ── 全平台汇总卡片（只读） ── */}
      <Card className="border-[#D9C5A0]/50 bg-gradient-to-r from-[#FCFAF7] to-[#D9C5A0]/10">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-[#002B49] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#D9C5A0]" />
              </div>
              <div>
                <CardTitle className="text-base">全平台汇总</CardTitle>
                <CardDescription className="text-xs mt-1">
                  统计全部 12 个学会（1 个总学会 + 11 个专业分会）的整体运营数据，仅作只读展示。
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 bg-slate-100 text-slate-500 border-slate-300 text-[10px]"
            >
              只读
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              全站注册用户{" "}
              <strong className="text-strata-blue-deep">{totalUsers}</strong> 人
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              已发布会议{" "}
              <strong className="text-strata-blue-deep">{publishedConfs}</strong> 场
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>
              累计会议费{" "}
              <strong className="text-strata-blue-deep">
                ¥{globalStats.totalConferenceFee.toLocaleString()}
              </strong>
            </span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/conferences">管理全部会议 →</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/statistics">查看全部学会统计 →</Link>
          </Button>
        </CardContent>
      </Card>

      {/* ── 12 个可管理学会卡片 ── */}
      <div>
        <h2 className="text-lg font-semibold text-strata-blue-deep mb-1">
          12 个学会（总学会 + 11 个专业分会）
        </h2>
        <p className="text-sm text-muted-foreground">
          总学会置顶显示，每个学会均可独立编辑信息与启用/禁用
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 总学会卡片（固定第一） */}
        <Card
          className={`border-[#D9C5A0] ${
            totalSociety.disabled
              ? "opacity-60"
              : "bg-gradient-to-br from-[#FCFAF7] to-[#D9C5A0]/10"
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-[#002B49] flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#D9C5A0]" />
                </div>
                <div>
                  <CardTitle className="text-base">{totalSociety.name}</CardTitle>
                  <CardDescription className="text-xs">{TOTAL_SOCIETY_ID}</CardDescription>
                </div>
              </div>
              {totalSociety.disabled && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  已禁用
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {totalSociety.description || TOTAL_SOCIETY_INTRO}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {totalSocietyConfs} 场会议
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-[#D9C5A0]/20 text-[#715a3e] border-[#D9C5A0]"
              >
                总学会
              </Badge>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit("total")}
              >
                <Edit className="h-3 w-3 mr-1" />
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  totalSociety.disabled
                    ? "text-green-600 border-green-300 hover:bg-green-50"
                    : "text-party-red border-party-red/30 hover:bg-party-red/5"
                }
                onClick={() => handleToggle("total")}
              >
                {totalSociety.disabled ? "启用" : "禁用"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 11 个分会卡片 */}
        {branches.map((branch: BranchRecord) => (
          <Card key={branch.id} className={branch.disabled ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {branch.logo ? (
                    <img
                      src={branch.logo}
                      alt={branch.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-strata-blue-deep/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-strata-blue-deep" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <CardDescription className="text-xs">{branch.id}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {branch.description || "暂无描述"}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {branch.memberCount} 名会员
                </Badge>
                {branch.disabled && (
                  <Badge variant="destructive" className="text-xs">
                    已禁用
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(branch)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    branch.disabled
                      ? "text-green-600 border-green-300 hover:bg-green-50"
                      : "text-party-red border-party-red/30 hover:bg-party-red/5"
                  }
                  onClick={() => handleToggle(branch)}
                >
                  {branch.disabled ? "启用" : "禁用"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 编辑弹窗（共用：总学会 + 分会） ── */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              编辑{editTarget === "total" ? "总学会" : "分会"}信息
            </DialogTitle>
            <DialogDescription>
              {editTarget === "total"
                ? TOTAL_SOCIETY_ID
                : (editTarget as BranchRecord)?.id}{" "}
              —{" "}
              {editTarget === "total"
                ? totalSociety.name
                : (editTarget as BranchRecord)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">名称</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="请输入名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">描述</Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="请输入描述"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditTarget(null);
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 禁用/启用确认弹窗（共用） ── */}
      <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleDisabled ? "启用" : "禁用"}学会
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{toggleDisabled ? "启用" : "禁用"}「{toggleName}」吗？
              {toggleDisabled
                ? "启用后该学会将恢复正常运营。"
                : "禁用后该学会相关功能将受到限制，已进行中的会议报名不受影响。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToggleTarget(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleConfirm}
              className={
                toggleDisabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-party-red hover:bg-party-red-dark"
              }
            >
              确认{toggleDisabled ? "启用" : "禁用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
