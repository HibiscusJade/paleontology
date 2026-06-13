import { useState, useMemo } from "react";
import { useAdmin, type ConferenceRecord, type ConferenceData } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, MapPin, Calendar, Users, AlertCircle } from "lucide-react";
import { BRANCH_MAP } from "@shared/constants";

const BRANCH_OPTIONS = Object.entries(BRANCH_MAP).map(([id, name]) => ({ value: id, label: name }));

const DEFAULT_SESSION = { id: `session-${Date.now()}`, name: "" };

function ConferenceForm({
  initialData,
  onSubmit,
  onCancel,
  title,
}: {
  initialData?: ConferenceRecord;
  onSubmit: (data: ConferenceData) => void;
  onCancel: () => void;
  title: string;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [branchId, setBranchId] = useState(initialData?.branchId || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [memberFee, setMemberFee] = useState(initialData?.memberFee?.toString() || "");
  const [nonMemberFee, setNonMemberFee] = useState(initialData?.nonMemberFee?.toString() || "");
  const [paymentDeadline, setPaymentDeadline] = useState(initialData?.paymentDeadline || "");
  const [abstractDeadline, setAbstractDeadline] = useState(initialData?.abstractDeadline || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>(
    initialData?.sessions || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMemberFeeChange = (value: string) => {
    setMemberFee(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setNonMemberFee(Math.round(num * 1.1).toString());
    }
  };

  const addSession = () => {
    setSessions([...sessions, { id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "" }]);
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const updateSessionName = (id: string, name: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "请输入会议名称";
    if (!branchId) newErrors.branchId = "请选择分会";
    if (!startDate) newErrors.startDate = "请选择开始日期";
    if (!endDate) newErrors.endDate = "请选择结束日期";
    if (!location.trim()) newErrors.location = "请输入地点";
    if (!memberFee || isNaN(parseFloat(memberFee))) newErrors.memberFee = "请输入有效的会员费";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      branchId,
      startDate,
      endDate,
      location: location.trim(),
      memberFee: parseFloat(memberFee),
      nonMemberFee: parseFloat(nonMemberFee) || Math.round(parseFloat(memberFee) * 1.1),
      paymentDeadline,
      abstractDeadline,
      sessions: sessions.filter((s) => s.name.trim()),
      status,
    });
  };

  return (
    <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="conf-name">会议名称 *</Label>
          <Input id="conf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入会议名称" />
          {errors.name && <p className="text-party-red text-xs">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-branch">主办分会 *</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger id="conf-branch">
              <SelectValue placeholder="选择分会" />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.branchId && <p className="text-party-red text-xs">{errors.branchId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-location">地点 *</Label>
          <Input id="conf-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="如：北京" />
          {errors.location && <p className="text-party-red text-xs">{errors.location}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-start">开始日期 *</Label>
          <Input id="conf-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          {errors.startDate && <p className="text-party-red text-xs">{errors.startDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-end">结束日期 *</Label>
          <Input id="conf-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {errors.endDate && <p className="text-party-red text-xs">{errors.endDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-member-fee">会员费 (¥) *</Label>
          <Input id="conf-member-fee" type="number" value={memberFee} onChange={(e) => handleMemberFeeChange(e.target.value)} placeholder="会员价格" />
          {errors.memberFee && <p className="text-party-red text-xs">{errors.memberFee}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-nonmember-fee">非会员费 (¥)</Label>
          <Input id="conf-nonmember-fee" type="number" value={nonMemberFee} onChange={(e) => setNonMemberFee(e.target.value)} placeholder="非会员自动比会员费+10%" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-pay-deadline">缴费截止日期</Label>
          <Input id="conf-pay-deadline" type="date" value={paymentDeadline} onChange={(e) => setPaymentDeadline(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-abs-deadline">摘要截止日期</Label>
          <Input id="conf-abs-deadline" type="date" value={abstractDeadline} onChange={(e) => setAbstractDeadline(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conf-status">状态</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger id="conf-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="published">发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>分会场</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSession}>
            <Plus className="h-3 w-3 mr-1" />
            添加分会场
          </Button>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂未添加分会场</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-2">
                <Input
                  value={session.name}
                  onChange={(e) => updateSessionName(session.id, e.target.value)}
                  placeholder="分会场名称"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-party-red hover:text-party-red-dark h-8 w-8 p-0"
                  onClick={() => removeSession(session.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={handleSubmit} className="bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white">
          {initialData ? "保存更改" : "创建会议"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function ConferenceManagement() {
  const { adminRole, adminBranchId, getAllConferences, getBranchConferences, createConference, updateConference } = useAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConf, setEditingConf] = useState<ConferenceRecord | undefined>(undefined);

  const conferences = useMemo(() => {
    if (adminRole === "branch_admin" && adminBranchId) {
      return getBranchConferences(adminBranchId);
    }
    return getAllConferences();
  }, [adminRole, adminBranchId, getAllConferences, getBranchConferences]);

  const handleCreate = () => {
    setEditingConf(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (conf: ConferenceRecord) => {
    setEditingConf(conf);
    setDialogOpen(true);
  };

  const handleSubmit = (data: ConferenceData) => {
    if (editingConf) {
      updateConference(editingConf.id, data);
    } else {
      createConference(data);
    }
    setDialogOpen(false);
    setEditingConf(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-strata-blue-deep">会议管理</h1>
          <p className="text-muted-foreground mt-1">管理学术会议和分会场设置</p>
        </div>
        <Button onClick={handleCreate} className="bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新建会议
        </Button>
      </div>

      {conferences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <AlertCircle className="h-8 w-8" />
            <span>暂无会议数据</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conf: ConferenceRecord) => (
            <Card key={conf.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base pr-2">{conf.name}</CardTitle>
                  <Badge variant="outline" className={conf.status === "published" ? "text-green-600 border-green-300 bg-green-50 shrink-0" : "text-gray-500 border-gray-300 bg-gray-50 shrink-0"}>
                    {conf.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                </div>
                <CardDescription>{conf.branchName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{conf.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{conf.startDate} 至 {conf.endDate}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>报名: {conf.registrations} 人</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">
                    会员: ¥{conf.memberFee} / 非会员: ¥{conf.nonMemberFee}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(conf)}>
                    <Edit className="h-3 w-3 mr-1" />
                    编辑
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingConf(undefined); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConf ? "编辑会议" : "新建会议"}</DialogTitle>
            <DialogDescription>
              {editingConf ? "修改会议信息" : "创建新的学术会议"}
            </DialogDescription>
          </DialogHeader>
          <ConferenceForm
            initialData={editingConf}
            onSubmit={handleSubmit}
            onCancel={() => { setDialogOpen(false); setEditingConf(undefined); }}
            title={editingConf ? "编辑会议" : "新建会议"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
