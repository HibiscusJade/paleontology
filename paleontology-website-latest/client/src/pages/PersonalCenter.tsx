import { useState } from "react";
import PartyLayout from "../components/PartyLayout";
import { useMembership } from "../contexts/MembershipContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// 分会 ID → 名称映射（与 Services.tsx 保持一致）
const BRANCH_MAP: Record<string, string> = {
  "gwjzdwxfh": "古无脊椎动物学分会",
  "kpgzwyh": "科普工作委员会",
  "bfxfh": "孢粉学分会",
  "wtxfh": "微体学分会",
  "hszlzwyh": "化石藻类专业委员会",
  "gzwxfh": "古植物学分会",
  "dqswx": "地球生物学分会",
  "gst": "古生态专业分会",
  "gjzdw": "古脊椎动物学分会",
  "swcj": "生物沉积学分会",
  "xjsxff": "新技术新方法专业委员会",
};

// 会议 ID → 名称映射（与 Services.tsx 保持一致，共 9 场）
const CONF_MAP: Record<string, { title: string; branchName: string; time: string; location: string; fee: number }> = {
  "demo-conf": { title: "【演示会议】古无脊椎动物学学术工作坊", branchName: "古无脊椎动物学分会", time: "2026年06月15日", location: "线上 · 腾讯会议", fee: 300 },
  "conf-1": { title: "第十五届全国微体古生物学学术研讨会", branchName: "微体学分会", time: "2026年11月15日 - 11月18日", location: "江苏 · 南京", fee: 1200 },
  "conf-2": { title: "2026年度古植物学与环境演变论坛", branchName: "古植物学分会", time: "2026年12月05日 - 12月07日", location: "北京 · 中国科学院", fee: 800 },
  "conf-3": { title: "热河生物群国际学术研讨会", branchName: "古脊椎动物学分会", time: "2027年03月20日 - 03月23日", location: "辽宁 · 朝阳", fee: 1500 },
  "conf-4": { title: "第十二届全国古脊椎动物学学术年会", branchName: "古脊椎动物学分会", time: "2026年09月18日 - 09月21日", location: "云南 · 昆明", fee: 1000 },
  "conf-5": { title: "中国孢粉学会第十届全国学术大会", branchName: "孢粉学分会", time: "2026年10月22日 - 10月25日", location: "广东 · 广州", fee: 900 },
  "conf-6": { title: "古生态学与古环境重建国际研讨会", branchName: "古生态专业分会", time: "2026年08月10日 - 08月13日", location: "四川 · 成都", fee: 1100 },
  "conf-7": { title: "地球生物学前沿论坛", branchName: "地球生物学分会", time: "2026年07月05日 - 07月07日", location: "湖北 · 武汉", fee: 600 },
  "conf-8": { title: "古生物学新技术新方法专题研讨会", branchName: "新技术新方法专业委员会", time: "2026年11月28日 - 11月30日", location: "湖北 · 武汉（中国地质大学）", fee: 500 },
};

export default function PersonalCenter() {
  const { currentUser, isLoggedIn, societyMembership, boundBranches, conferenceRegs, userType } = useMembership();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "branches" | "conferences" | "payments">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    gender: currentUser?.gender || "男",
    unit: currentUser?.unit || "",
    role: currentUser?.role || "",
    title: currentUser?.title || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!isLoggedIn || !currentUser) {
    return (
      <PartyLayout currentPageTitle="个人中心" breadcrumbs={[{ title: "个人中心", href: "/personal-center" }]}>
        <div className="max-w-4xl mx-auto py-16 px-6 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">account_circle</span>
          <h2 className="text-2xl font-bold text-[#002B49] mb-4">请先登录</h2>
          <p className="text-slate-600 mb-6">您需要登录才能访问个人中心。</p>
          <Button onClick={() => setLocation("/services?tab=member")} className="bg-[#002B49] hover:bg-[#001f35] text-white">
            返回学会服务
          </Button>
        </div>
      </PartyLayout>
    );
  }

  const handleEditChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim()) { toast.error("姓名不能为空"); return; }
    if (!formData.unit.trim()) { toast.error("单位不能为空"); return; }
    toast.success("个人信息已更新");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.oldPassword) { toast.error("请输入原密码"); return; }
    if (!passwordData.newPassword) { toast.error("请输入新密码"); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("新密码与确认密码不一致"); return; }
    if (passwordData.newPassword.length < 6) { toast.error("新密码至少需要6个字符"); return; }
    toast.success("密码已修改");
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordChange(false);
  };

  // 已绑定分会列表
  const myBoundBranches = (boundBranches || []).map((id: string) => ({
    id,
    name: BRANCH_MAP[id] || id,
  }));

  // 会议报名记录
  const myConferences = Object.entries(conferenceRegs || {}).map(([confId, reg]: [string, any]) => ({
    confId,
    confInfo: CONF_MAP[confId] || { title: `会议 #${confId}`, branchName: "未知分会", time: "-", location: "-", fee: reg.feeAmount || 0 },
    ...reg,
  }));

  // 缴费记录（学会会费历史 + 会议费）
  // 当 history 为空但 status 已有记录时，直接构建一条显示
  const MEMBER_FEE = (() => { try { const stored = localStorage.getItem("paleo_membership_fee_config"); if (stored) { const c = JSON.parse(stored); return c.standard || 200; } } catch {} return 200; })();
  const rawHistory = societyMembership?.history || [];
  const societyPayHistory = rawHistory.length > 0
    ? rawHistory
    : (societyMembership?.status && societyMembership.status !== "not_member")
      ? [{
          id: "auto",
          type: "society_fee" as const,
          targetName: "中国古生物学会会员费",
          amount: societyMembership.amount || MEMBER_FEE,
          voucherUrl: "",
          invoiceUrl: "",
          submitTime: societyMembership.expiryDate ? "-" : "-",
          status: societyMembership.status === "active" ? "approved" as const : societyMembership.status === "voucher_submitted" || societyMembership.status === "pending" ? "voucher_submitted" as const : societyMembership.status === "invoice_submitted" ? "invoice_submitted" as const : "rejected" as const
        }]
      : [];
  const confPayHistory = Object.entries(conferenceRegs || {})
    .filter(([, reg]: [string, any]) => reg.status && reg.status !== "unpaid")
    .map(([confId, reg]: [string, any]) => ({
      confId,
      title: CONF_MAP[confId]?.title || `会议 #${confId}`,
      branchName: CONF_MAP[confId]?.branchName || "未知分会",
      fee: CONF_MAP[confId]?.fee || (reg as any).feeAmount || 0,
      status: (reg as any).status,
      submittedAt: (reg as any).lastUpdated || (reg as any).submittedAt || "-",
    }));

  const getMemberStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-50 text-green-700 border border-green-200";
      case "voucher_submitted":
      case "pending": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "voucher_rejected": return "bg-red-50 text-red-700 border border-red-200";
      case "invoice_pending": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "invoice_overdue": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "invoice_submitted": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "invoice_rejected":
      case "rejected": return "bg-red-50 text-red-700 border border-red-200";
      case "expired": return "bg-gray-50 text-gray-600 border border-gray-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const getMemberStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "✓ 会员资格有效";
      case "approved": return "✓ 已审核通过";
      case "voucher_submitted":
      case "pending": return "⏳ 凭证初审中";
      case "voucher_rejected": return "✕ 凭证被驳回";
      case "invoice_pending": return "待上传发票";
      case "invoice_overdue": return "⚠ 发票逾期";
      case "invoice_submitted": return "⏳ 发票终审中";
      case "invoice_rejected":
      case "rejected": return "✕ 发票被驳回";
      case "expired": return "已过期";
      default: return "未缴费";
    }
  };

  const getMemberStatusBadgeByRecord = (record: any) => {
    if (societyMembership?.status === "active") return "bg-green-50 text-green-700 border border-green-200";
    return getMemberStatusBadge(societyMembership?.status || record.status);
  };

  const getMemberStatusLabelByRecord = (record: any) => {
    if (societyMembership?.status === "active") return "✓ 会员资格有效";
    return getMemberStatusLabel(societyMembership?.status || record.status);
  };

  const getConfStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "submitted":
      case "approved_unfilled":
      case "approved_invoice":
      case "active": return "bg-green-50 text-green-700 border border-green-200";
      case "voucher_submitted":
      case "pending": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "voucher_rejected": return "bg-red-50 text-red-700 border border-red-200";
      case "invoice_pending": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "invoice_overdue": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "invoice_submitted": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "invoice_rejected":
      case "rejected": return "bg-red-50 text-red-700 border border-red-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const getConfStatusLabel = (status: string) => {
    switch (status) {
      case "voucher_submitted":
      case "pending": return "⏳ 凭证初审中";
      case "voucher_rejected": return "✕ 凭证被驳回";
      case "invoice_pending": return "待上传发票";
      case "invoice_overdue": return "⚠ 发票逾期";
      case "invoice_submitted": return "⏳ 发票终审中";
      case "invoice_rejected":
      case "rejected": return "✕ 发票被驳回";
      case "confirmed": return "✓ 已确认";
      case "approved_unfilled":
      case "approved_invoice":
      case "active": return "✓ 已缴费";
      case "submitted": return "✓ 已报名";
      default: return status;
    }
  };

  const tabs = [
    { key: "profile", label: "个人信息", icon: "person" },
    { key: "branches", label: "我的分会", icon: "account_tree" },
    { key: "conferences", label: "我的会议", icon: "event" },
    { key: "payments", label: "缴费记录", icon: "receipt_long" },
  ] as const;

  return (
    <PartyLayout currentPageTitle="个人中心" breadcrumbs={[{ title: "个人中心", href: "/personal-center" }]}>
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Tab Navigation */}
        <div className="flex gap-0 mb-8 border-b border-[#E5E1DA] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "text-[#002B49] border-b-2 border-[#002B49]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
              {tab.key === "branches" && myBoundBranches.length > 0 && (
                <span className="ml-1 bg-[#002B49] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {myBoundBranches.length}
                </span>
              )}
              {tab.key === "conferences" && myConferences.length > 0 && (
                <span className="ml-1 bg-[#002B49] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {myConferences.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== 个人信息 Tab ===== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card className="border border-[#E5E1DA] shadow-sm">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#002B49] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {currentUser.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#002B49]">{currentUser.name}</h2>
                      <p className="text-sm text-slate-500">{currentUser.email}</p>
                      {userType === "non_member" && (
                        <span className="inline-block mt-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          非会员
                        </span>
                      )}
                      {userType === "regular" && (
                        <span className="inline-block mt-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          待选择参与方式
                        </span>
                      )}
                      {societyMembership?.status === "active" && (
                        <span className="inline-block mt-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ 学会正式会员
                        </span>
                      )}
                      {(societyMembership?.status === "voucher_submitted" || societyMembership?.status === "pending") && (
                        <span className="inline-block mt-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⏳ 凭证初审中
                        </span>
                      )}
                      {societyMembership?.status === "invoice_pending" && (
                        <span className="inline-block mt-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          待上传发票
                        </span>
                      )}
                      {societyMembership?.status === "invoice_submitted" && (
                        <span className="inline-block mt-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⏳ 发票终审中
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditing && !showPasswordChange && (
                    <Button onClick={() => setIsEditing(true)} className="bg-[#002B49] hover:bg-[#001f35] text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit</span> 编辑信息
                    </Button>
                  )}
                </div>

                {!showPasswordChange && (
                  <div className="space-y-5">
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">邮箱（不可编辑）</Label>
                      <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{currentUser.email}</div>
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">姓名 <span className="text-red-500">*</span></Label>
                      {isEditing ? (
                        <Input value={formData.name} onChange={(e) => handleEditChange("name", e.target.value)} className="border-[#E5E1DA]" placeholder="请输入姓名" />
                      ) : (
                        <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{formData.name}</div>
                      )}
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">性别</Label>
                      {isEditing ? (
                        <select value={formData.gender} onChange={(e) => handleEditChange("gender", e.target.value)} className="w-full border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">
                          <option value="男">男</option>
                          <option value="女">女</option>
                        </select>
                      ) : (
                        <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{formData.gender}</div>
                      )}
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">工作/学习单位 <span className="text-red-500">*</span></Label>
                      {isEditing ? (
                        <Input value={formData.unit} onChange={(e) => handleEditChange("unit", e.target.value)} className="border-[#E5E1DA]" placeholder="请输入工作/学习单位" />
                      ) : (
                        <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{formData.unit}</div>
                      )}
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">职务类型（可选）</Label>
                      {isEditing ? (
                        <div className="flex gap-2 flex-wrap">
                          {["学生", "老师", "其他"].map((r) => (
                            <button key={r} onClick={() => handleEditChange("role", r)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${formData.role === r ? "bg-[#002B49] text-white" : "border border-[#002B49] text-[#002B49] hover:bg-slate-50"}`}>{r}</button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{formData.role || "未填写"}</div>
                      )}
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">职称（可选）</Label>
                      {isEditing ? (
                        <Input value={formData.title} onChange={(e) => handleEditChange("title", e.target.value)} className="border-[#E5E1DA]" placeholder="如：教授、博士后、硕士生等" />
                      ) : (
                        <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg px-4 py-3 text-slate-700 text-sm">{formData.title || "未填写"}</div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <Button onClick={() => setIsEditing(false)} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50">取消</Button>
                        <Button onClick={handleSaveProfile} className="flex-1 bg-[#002B49] hover:bg-[#001f35] text-white">保存修改</Button>
                      </div>
                    )}
                  </div>
                )}

                {showPasswordChange && (
                  <div className="space-y-5">
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">原密码 <span className="text-red-500">*</span></Label>
                      <Input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="border-[#E5E1DA]" placeholder="请输入原密码" />
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">新密码 <span className="text-red-500">*</span></Label>
                      <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="border-[#E5E1DA]" placeholder="请输入新密码（至少6位）" />
                    </div>
                    <div>
                      <Label className="font-bold text-[#002B49] mb-2 block text-sm">确认新密码 <span className="text-red-500">*</span></Label>
                      <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="border-[#E5E1DA]" placeholder="请再次输入新密码" />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                      <Button onClick={() => setShowPasswordChange(false)} className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50">取消</Button>
                      <Button onClick={handleChangePassword} className="flex-1 bg-[#002B49] hover:bg-[#001f35] text-white">修改密码</Button>
                    </div>
                  </div>
                )}

                {!isEditing && !showPasswordChange && (
                  <div className="pt-6 border-t border-slate-100">
                    <Button onClick={() => setShowPasswordChange(true)} className="border border-[#002B49] text-[#002B49] hover:bg-slate-50">
                      <span className="material-symbols-outlined text-sm mr-1">lock</span> 修改密码
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border border-[#E5E1DA] shadow-sm bg-blue-50">
              <div className="p-6">
                <h3 className="font-bold text-[#002B49] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span> 账户安全提示
                </h3>
                <ul className="text-sm text-slate-700 space-y-2 ml-6">
                  <li>• 邮箱地址是您的唯一登录凭证，无法修改。</li>
                  <li>• 请定期修改密码以保护账户安全。</li>
                  <li>• 修改密码时需要输入原密码进行验证。</li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        {/* ===== 我的分会 Tab ===== */}
        {activeTab === "branches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#002B49] flex items-center gap-2">
                <span className="material-symbols-outlined">account_tree</span>
                我的分会
              </h3>
              <span className="text-sm text-slate-500">已绑定 {myBoundBranches.length} / 11 个分会</span>
            </div>

            {/* 会员状态提示 */}
            {userType === "regular" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 mt-0.5">lock</span>
                <div>
                  <p className="font-bold">需要先选择参与方式</p>
                  <p className="text-amber-700 mt-1">请先选择成为会员或作为非会员使用，即可绑定专业分会。</p>
                </div>
              </div>
            )}
            {userType === "member" && societyMembership?.status !== "active" && societyMembership?.status !== "invoice_pending" && societyMembership?.status !== "invoice_submitted" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 mt-0.5">lock</span>
                <div>
                  <p className="font-bold">需要先成为学会会员</p>
                  <p className="text-amber-700 mt-1">缴纳学会会员费并审核通过后，即可绑定专业分会。</p>
                  <button onClick={() => setLocation("/services?tab=member")} className="mt-2 text-[#002B49] font-bold underline text-xs">
                    前往申请入会 →
                  </button>
                </div>
              </div>
            )}

            {myBoundBranches.length === 0 ? (
              <Card className="border border-[#E5E1DA] shadow-sm p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">account_tree</span>
                <p className="text-slate-500 mb-4">您还未绑定任何专业分会</p>
                <Button onClick={() => setLocation("/services?tab=member")} className="bg-[#002B49] hover:bg-[#001f35] text-white">
                  前往绑定分会
                </Button>
              </Card>
            ) : (
              <div className="grid gap-3">
                {myBoundBranches.map((branch) => (
                  <Card key={branch.id} className="border border-green-200 bg-green-50/40 shadow-sm">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#002B49] rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[16px]">account_tree</span>
                        </div>
                        <div>
                          <p className="font-bold text-[#002B49] text-sm">{branch.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">绑定后可接收该分会的会议通知与学术资讯</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded-full">
                        ✓ 已绑定
                      </span>
                    </div>
                  </Card>
                ))}
                <div className="text-center pt-2">
                  <button onClick={() => setLocation("/services?tab=member")} className="text-sm text-[#002B49] font-bold hover:underline">
                    管理分会绑定 →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== 我的会议 Tab ===== */}
        {activeTab === "conferences" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#002B49] flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">event</span>
              我的会议
            </h3>

            {myConferences.length === 0 ? (
              <Card className="border border-[#E5E1DA] shadow-sm p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">event_busy</span>
                <p className="text-slate-500 mb-4">您还未报名参加任何会议</p>
                <Button onClick={() => setLocation("/services?tab=conference")} className="bg-[#002B49] hover:bg-[#001f35] text-white">
                  浏览会议列表
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myConferences.map((conf) => (
                  <Card key={conf.confId} className="border border-[#E5E1DA] shadow-sm">
                    <div className="p-5 space-y-3">
                      {/* 会议标题和状态 */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-[#002B49] text-sm leading-snug">{conf.confInfo.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{conf.confInfo.branchName}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${getConfStatusBadge(conf.status)}`}>
                          {getConfStatusLabel(conf.status)}
                        </span>
                      </div>

                      {/* 会议基本信息 */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {conf.confInfo.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {conf.confInfo.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          注册费：¥{conf.confInfo.fee}
                        </div>
                        {conf.submittedAt && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            提交时间：{conf.submittedAt}
                          </div>
                        )}
                      </div>

                      {/* 发票截止日倒计时 */}
                      {conf.status === "invoice_pending" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                          {(() => {
                            const deadline = conf.invoiceDeadline;
                            if (deadline) {
                              const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              return daysLeft > 0
                                ? <span>发票上传截止：{deadline}（剩余 {daysLeft} 天）</span>
                                : <span className="text-red-600 font-bold">发票已逾期！</span>;
                            }
                            return <span>请完成发票上传</span>;
                          })()}
                        </div>
                      )}

                      {conf.status === "invoice_overdue" && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700 font-bold">
                          ⚠ 发票上传已逾期
                        </div>
                      )}

                      {/* 参会信息（已通过后显示） */}
                      {(conf.status === "confirmed" || conf.status === "invoice_pending" || conf.status === "invoice_overdue" || conf.status === "invoice_submitted" || conf.status === "submitted" || conf.status === "approved_unfilled") && conf.name && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs space-y-1">
                          <p className="font-bold text-green-700 mb-1">参会信息</p>
                          {conf.name && <p className="text-green-700">姓名：{conf.name}</p>}
                          {conf.role && <p className="text-green-700">身份：{conf.role}</p>}
                          {conf.presentationType && <p className="text-green-700">报告类型：{conf.presentationType}</p>}
                          {conf.reportTitle && <p className="text-green-700">报告题目：{conf.reportTitle}</p>}
                          {conf.accommodation && <p className="text-green-700">住宿：{conf.accommodation}</p>}
                        </div>
                      )}

                      {/* 驳回原因 */}
                      {(conf.status === "voucher_rejected" || conf.status === "rejected") && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                          <p className="font-bold text-red-700">凭证驳回原因：</p>
                          <p className="text-red-600 mt-1">{conf.voucherRejectReason || conf.rejectReason || "—"}</p>
                        </div>
                      )}
                      {conf.status === "invoice_rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                          <p className="font-bold text-red-700">发票驳回原因：</p>
                          <p className="text-red-600 mt-1">{conf.invoiceRejectReason || "—"}</p>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      {conf.status === "invoice_pending" && (
                        <button
                          onClick={() => setLocation("/services?tab=conference")}
                          className="w-full bg-[#002B49] hover:bg-[#001f35] text-white px-4 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_note</span>
                          前往填写信息 / 上传发票
                        </button>
                      )}
                      {conf.status === "approved_unfilled" && (
                        <button
                          onClick={() => setLocation("/services?tab=conference")}
                          className="w-full bg-[#002B49] hover:bg-[#001f35] text-white px-4 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_note</span>
                          前往填写参会信息
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== 缴费记录 Tab ===== */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* 学会会费记录 */}
            <div>
              <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px]">card_membership</span>
                学会会员费记录
              </h3>
              {societyPayHistory.length === 0 ? (
                <Card className="border border-[#E5E1DA] shadow-sm p-6 text-center">
                  <p className="text-slate-500 text-sm">暂无学会会费缴纳记录</p>
                  <button onClick={() => setLocation("/services?tab=member")} className="mt-3 text-sm text-[#002B49] font-bold hover:underline">
                    前往申请入会 →
                  </button>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {societyPayHistory.map((record: any, idx: number) => (
                    <Card key={idx} className="border border-[#E5E1DA] shadow-sm">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">receipt</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#002B49] text-sm">中国古生物学会会员费</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              缴费金额：¥{record.amount || societyMembership?.amount || "-"}
                              {record.date && <span className="ml-2">· {record.date}</span>}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getMemberStatusBadgeByRecord(record)}`}>
                          {getMemberStatusLabelByRecord(record)}
                        </span>
                      </div>
                      {societyMembership?.status === "active" && idx === 0 && (
                        <div className="px-4 pb-3 text-xs text-green-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">event_available</span>
                          会员有效期至：{societyMembership?.expiryDate || "-"}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 会议费记录 */}
            <div>
              <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px]">payments</span>
                会议注册费记录
              </h3>
              {confPayHistory.length === 0 ? (
                <Card className="border border-[#E5E1DA] shadow-sm p-6 text-center">
                  <p className="text-slate-500 text-sm">暂无会议注册费缴纳记录</p>
                  <button onClick={() => setLocation("/services?tab=conference")} className="mt-3 text-sm text-[#002B49] font-bold hover:underline">
                    浏览会议列表 →
                  </button>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {confPayHistory.map((record, idx) => (
                    <Card key={idx} className="border border-[#E5E1DA] shadow-sm">
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">receipt_long</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#002B49] text-sm leading-snug">{record.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{record.branchName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              注册费：¥{record.fee}
                              {record.submittedAt && <span className="ml-2">· 提交于 {record.submittedAt}</span>}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${getConfStatusBadge(record.status)}`}>
                          {getConfStatusLabel(record.status)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PartyLayout>
  );
}
