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
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Edit, Users, AlertCircle } from "lucide-react";

export default function BranchManagement() {
  const { getAllBranches, updateBranch, toggleBranchDisabled } = useAdmin();
  const branches = getAllBranches();

  const [editBranch, setEditBranch] = useState<BranchRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLogo, setEditLogo] = useState("");

  const [toggleBranch, setToggleBranch] = useState<BranchRecord | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);

  const handleEdit = (branch: BranchRecord) => {
    setEditBranch(branch);
    setEditName(branch.name);
    setEditDescription(branch.description || "");
    setEditLogo(branch.logo || "");
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editBranch) return;
    updateBranch(editBranch.id, {
      name: editName.trim() || editBranch.name,
      description: editDescription.trim(),
      logo: editLogo.trim() || undefined,
    });
    setEditOpen(false);
    setEditBranch(null);
  };

  const handleToggle = (branch: BranchRecord) => {
    setToggleBranch(branch);
    setToggleOpen(true);
  };

  const handleToggleConfirm = () => {
    if (toggleBranch) {
      toggleBranchDisabled(toggleBranch.id);
    }
    setToggleOpen(false);
    setToggleBranch(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-strata-blue-deep">分会管理</h1>
        <p className="text-muted-foreground mt-1">管理学会下属专业分会信息</p>
      </div>

      {branches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <AlertCircle className="h-8 w-8" />
            <span>暂无分会数据</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    className={branch.disabled ? "text-green-600 border-green-300 hover:bg-green-50" : "text-party-red border-party-red/30 hover:bg-party-red/5"}
                    onClick={() => handleToggle(branch)}
                  >
                    {branch.disabled ? "启用" : "禁用"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditBranch(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分会信息</DialogTitle>
            <DialogDescription>
              {editBranch?.id} - {editBranch?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name">分会名称</Label>
              <Input
                id="branch-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="请输入分会名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-desc">描述</Label>
              <Textarea
                id="branch-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="请输入分会描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-logo">Logo URL</Label>
              <Input
                id="branch-logo"
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditBranch(null); }}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} className="bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleBranch?.disabled ? "启用" : "禁用"}分会
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要{toggleBranch?.disabled ? "启用" : "禁用"}「{toggleBranch?.name}」吗？
              {toggleBranch?.disabled ? "启用后该分会将恢复正常。" : "禁用后该分会的功能将受到限制。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToggleBranch(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleConfirm}
              className={toggleBranch?.disabled ? "bg-green-600 hover:bg-green-700" : "bg-party-red hover:bg-party-red-dark"}
            >
              确认{toggleBranch?.disabled ? "启用" : "禁用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
