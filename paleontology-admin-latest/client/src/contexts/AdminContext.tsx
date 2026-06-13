import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  type MembershipStatus,
  type ConferenceStatus,
  MEMBERSHIP_STATUS,
  CONFERENCE_STATUS,
  BRANCH_MAP,
  VALID_BRANCH_IDS,
} from "@shared/constants";

// ============================================================================
// TYPES
// ============================================================================

export type AdminRole = "super_admin" | "branch_admin" | "finance_reviewer";

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  branchId?: string;
  avatar?: string;
}

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export interface ReviewItem {
  id: string;
  userEmail: string;
  userName: string;
  type: "society_fee" | "conference_fee";
  targetName: string;
  amount: number;
  voucherUrl: string;
  invoiceUrl?: string;
  submitTime: string;
  ocrAmount?: number;
  status: string;
  rejectReason?: string;
  invoiceDeadline?: string;
  confId?: string;
}

export interface MemberRecord {
  email: string;
  name: string;
  gender: string;
  unit: string;
  role: string;
  memberType?: string;
  membershipStatus: string;
  boundBranches: string[];
  expiryDate?: string;
  userType: string;
  disabled?: boolean;
}

export interface MemberFilter {
  search?: string;
  status?: string;
  branchId?: string;
}

export interface MemberDetail extends MemberRecord {
  paymentHistory: {
    id: string;
    type: string;
    targetName: string;
    amount: number;
    voucherUrl: string;
    invoiceUrl: string;
    submitTime: string;
    auditTime?: string;
    status: string;
  }[];
  notifications: AdminNotification[];
}

export interface ConferenceRecord {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  startDate: string;
  endDate: string;
  location: string;
  memberFee: number;
  nonMemberFee: number;
  paymentDeadline: string;
  abstractDeadline: string;
  status: "draft" | "published";
  sessions: { id: string; name: string }[];
  registrations: number;
}

export interface ConferenceData {
  name: string;
  branchId: string;
  startDate: string;
  endDate: string;
  location: string;
  memberFee: number;
  nonMemberFee: number;
  paymentDeadline: string;
  abstractDeadline: string;
  sessions: { id: string; name: string }[];
  status: "draft" | "published";
}

export interface BranchRecord {
  id: string;
  name: string;
  description: string;
  logo?: string;
  memberCount: number;
  disabled: boolean;
}

export interface BranchData {
  name?: string;
  description?: string;
  logo?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingReviews: number;
  activeConferences: number;
  recentReviews: ReviewItem[];
  branchMemberCounts: { name: string; count: number }[];
  paymentTrend: { month: string; count: number }[];
}

export interface BranchDashboardStats {
  branchConferences: number;
  branchRegistrations: number;
  branchPendingReviews: number;
  branchMemberCount: number;
  recentRegistrations: { userName: string; conferenceName: string; time: string }[];
}

export interface FinanceDashboardStats {
  pendingVoucher: number;
  pendingInvoice: number;
  processedToday: number;
  overdueCount: number;
  voucherPassRate: number;
  invoicePassRate: number;
  recentReviews: ReviewItem[];
}

export interface AuditLogEntry {
  id: string;
  targetEmail: string;
  targetName: string;
  type: "society_fee" | "conference_fee";
  action: "approve_voucher" | "reject_voucher" | "approve_invoice" | "reject_invoice" | "extend_deadline";
  reviewer: string;
  reason?: string;
  time: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  adminLogin(email: string, password: string): boolean;
  adminLogout(): void;
  adminRole: AdminRole;
  adminBranchId: string | null;
  canAccess(path: string): boolean;
  getAllowedMenuItems(): MenuItem[];
  pendingVoucherReviews: ReviewItem[];
  pendingInvoiceReviews: ReviewItem[];
  approveVoucher(targetEmail: string, type: "society_fee" | "conference_fee", confId?: string): void;
  rejectVoucher(targetEmail: string, type: "society_fee" | "conference_fee", reason: string, confId?: string): void;
  approveInvoice(targetEmail: string, type: "society_fee" | "conference_fee", confId?: string): void;
  rejectInvoice(targetEmail: string, type: "society_fee" | "conference_fee", reason: string, confId?: string): void;
  batchApproveVoucher(ids: string[]): void;
  batchRejectVoucher(ids: string[], reason: string): void;
  batchApproveInvoice(ids: string[]): void;
  batchRejectInvoice(ids: string[], reason: string): void;
  extendDeadline(targetEmail: string, type: "society_fee" | "conference_fee", newDeadline: string, reason: string, confId?: string): void;
  getAllMembers(filters?: MemberFilter): MemberRecord[];
  getMemberDetail(email: string): MemberDetail | null;
  toggleMemberDisabled(email: string): void;
  manualActivateMember(email: string): void;
  getAllConferences(): ConferenceRecord[];
  getBranchConferences(branchId: string): ConferenceRecord[];
  createConference(data: ConferenceData): void;
  updateConference(id: string, data: ConferenceData): void;
  getDashboardStats(): DashboardStats;
  getBranchDashboardStats(branchId: string): BranchDashboardStats;
  getFinanceDashboardStats(): FinanceDashboardStats;
  getAllPaymentRecords(): ReviewItem[];
  getAllBranches(): BranchRecord[];
  updateBranch(id: string, data: Partial<BranchRecord>): void;
  toggleBranchDisabled(id: string): void;
  notifications: AdminNotification[];
  addNotification(n: Omit<AdminNotification, "id" | "time" | "read">): void;
  markAllRead(): void;
  unreadCount: number;
}

// ============================================================================
// BUILT-IN ADMIN ACCOUNTS
// ============================================================================

const BUILT_IN_ADMINS: (AdminUser & { password: string })[] = [
  {
    email: "admin@paleontology.org.cn",
    password: "admin123",
    name: "学会总管理员",
    role: "super_admin" as AdminRole,
  },
  {
    email: "branch@gjzdw.org.cn",
    password: "admin123",
    name: "古脊椎动物学分会管理员",
    role: "branch_admin" as AdminRole,
    branchId: "gjzdw",
  },
  {
    email: "finance@paleontology.org.cn",
    password: "admin123",
    name: "财务审核员",
    role: "finance_reviewer" as AdminRole,
  },
];

// ============================================================================
// ROUTE PERMISSION CONFIG
// ============================================================================

const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/admin/dashboard": ["super_admin", "branch_admin", "finance_reviewer"],
  "/admin/audit": ["super_admin", "finance_reviewer"],
  "/admin/members": ["super_admin"],
  "/admin/conferences": ["super_admin", "branch_admin"],
  "/admin/statistics": ["super_admin", "branch_admin"],
  "/admin/finance": ["super_admin", "finance_reviewer"],
  "/admin/branches": ["super_admin"],
};

const ALL_MENU_ITEMS: MenuItem[] = [
  { path: "/admin/dashboard", label: "首页仪表盘", icon: "LayoutDashboard" },
  { path: "/admin/audit", label: "审核工作台", icon: "ClipboardCheck" },
  { path: "/admin/members", label: "会员管理", icon: "Users" },
  { path: "/admin/conferences", label: "会议管理", icon: "Calendar" },
  { path: "/admin/statistics", label: "数据统计", icon: "BarChart3" },
  { path: "/admin/finance", label: "财务记录", icon: "Receipt" },
  { path: "/admin/branches", label: "分会管理", icon: "Building2" },
];

// ============================================================================
// DEFAULT CONFERENCE DATA (seed)
// ============================================================================

const DEFAULT_CONFERENCES: ConferenceRecord[] = [
  {
    id: "conf-1", name: "第三届全国微体学学术研讨会", branchId: "wtxfh",
    branchName: "微体学分会", startDate: "2026-09-15", endDate: "2026-09-18",
    location: "南京", memberFee: 1200, nonMemberFee: 1320,
    paymentDeadline: "2026-08-15", abstractDeadline: "2026-07-30",
    status: "published",
    sessions: [{ id: "s1", name: "微体化石与生物地层学" }, { id: "s2", name: "微体古生态与古环境" }],
    registrations: 0,
  },
  {
    id: "conf-2", name: "古植物学与古气候重建研讨会", branchId: "gzwxfh",
    branchName: "古植物学分会", startDate: "2026-10-10", endDate: "2026-10-13",
    location: "北京", memberFee: 800, nonMemberFee: 880,
    paymentDeadline: "2026-09-10", abstractDeadline: "2026-08-25",
    status: "published",
    sessions: [{ id: "s1", name: "古植物系统分类" }],
    registrations: 0,
  },
  {
    id: "conf-3", name: "古脊椎动物学前沿论坛", branchId: "gjzdw",
    branchName: "古脊椎动物学分会", startDate: "2026-11-20", endDate: "2026-11-23",
    location: "西安", memberFee: 1500, nonMemberFee: 1650,
    paymentDeadline: "2026-10-20", abstractDeadline: "2026-10-05",
    status: "published",
    sessions: [{ id: "s1", name: "恐龙与中生代生态" }, { id: "s2", name: "早期人类演化" }],
    registrations: 0,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function addWorkdays(dateStr: string, workdays: number): string {
  const d = new Date(dateStr + "T00:00:00");
  let added = 0;
  while (added < workdays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString().split("T")[0];
}

function generateId(): string {
  return `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildReviewItem(
  email: string,
  user: { name?: string; email: string },
  type: "society_fee" | "conference_fee",
  confId?: string
): ReviewItem {
  const membershipKey = `paleo_society_membership_${email}`;
  const storedMembership = localStorage.getItem(membershipKey);
  const membership = storedMembership ? JSON.parse(storedMembership) : null;
  const confsKey = `paleo_confs_${email}`;
  const storedConfs = localStorage.getItem(confsKey);
  const confRegs = storedConfs ? JSON.parse(storedConfs) : {};

  if (type === "society_fee" && membership) {
    const lastPayment = membership.history?.slice(-1)[0];
    return {
      id: `voucher-${email}-society`,
      userEmail: email,
      userName: user.name || email,
      type: "society_fee",
      targetName: "中国古生物学会会员费",
      amount: lastPayment?.amount || 200,
      voucherUrl: lastPayment?.voucherUrl || "",
      invoiceUrl: lastPayment?.invoiceUrl || "",
      submitTime: lastPayment?.submitTime || "",
      status: membership.status || "not_member",
      rejectReason: membership.voucherRejectReason || membership.invoiceRejectReason,
      invoiceDeadline: membership.invoiceDeadline || membership.invoiceExtendedDeadline,
      confId: undefined,
    };
  }

  if (type === "conference_fee" && confId && confRegs[confId]) {
    const reg = confRegs[confId];
    return {
      id: `voucher-${email}-${confId}`,
      userEmail: email,
      userName: user.name || email,
      type: "conference_fee",
      targetName: confId,
      amount: reg.paymentVoucher ? 1000 : 0,
      voucherUrl: reg.paymentVoucher || "",
      invoiceUrl: reg.invoiceUrl || "",
      submitTime: reg.voucherSubmitTime || "",
      status: reg.status || "unpaid",
      rejectReason: reg.voucherRejectReason || reg.invoiceRejectReason,
      invoiceDeadline: reg.invoiceDeadline || reg.invoiceExtendedDeadline,
      confId,
    };
  }

  return {
    id: `voucher-${email}-unknown`,
    userEmail: email,
    userName: user.name || email,
    type,
    targetName: confId || "未知",
    amount: 0,
    voucherUrl: "",
    submitTime: "",
    status: "unknown",
    confId,
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshTrigger(t => t + 1), []);

  // Load persisted admin session
  useEffect(() => {
    const storedEmail = localStorage.getItem("paleo_admin_current_user");
    if (storedEmail) {
      const adminDb = JSON.parse(localStorage.getItem("paleo_admin_db") || JSON.stringify(BUILT_IN_ADMINS));
      const found = adminDb.find((a: AdminUser & { password?: string }) => a.email === storedEmail);
      if (found) {
        setAdminUser({ email: found.email, name: found.name, role: found.role, branchId: found.branchId });
      }
    }
    const storedNotifs = localStorage.getItem("paleo_admin_notifications");
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    if (!localStorage.getItem("paleo_admin_db")) {
      localStorage.setItem("paleo_admin_db", JSON.stringify(BUILT_IN_ADMINS));
    }
    if (!localStorage.getItem("paleo_conferences_db")) {
      localStorage.setItem("paleo_conferences_db", JSON.stringify(DEFAULT_CONFERENCES));
    }
  }, []);

  const persistNotifications = useCallback((n: AdminNotification[]) => {
    localStorage.setItem("paleo_admin_notifications", JSON.stringify(n));
  }, []);

  // ==========================================
  // AUTH
  // ==========================================

  const adminLogin = useCallback((email: string, password: string): boolean => {
    const adminDb = JSON.parse(localStorage.getItem("paleo_admin_db") || JSON.stringify(BUILT_IN_ADMINS));
    const found = adminDb.find(
      (a: AdminUser & { password: string }) =>
        a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (found) {
      const user: AdminUser = { email: found.email, name: found.name, role: found.role, branchId: found.branchId };
      setAdminUser(user);
      localStorage.setItem("paleo_admin_current_user", user.email);
      toast.success(`欢迎回来，${user.name}`);
      return true;
    }
    toast.error("账号或密码错误");
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUser(null);
    localStorage.removeItem("paleo_admin_current_user");
    toast.success("已安全退出");
  }, []);

  // ==========================================
  // PERMISSIONS
  // ==========================================

  const adminRole: AdminRole = adminUser?.role || "super_admin";
  const adminBranchId: string | null = adminUser?.branchId || null;

  const canAccess = useCallback(
    (path: string): boolean => {
      const allowed = ROUTE_PERMISSIONS[path];
      if (!allowed) return false;
      return allowed.includes(adminRole);
    },
    [adminRole]
  );

  const getAllowedMenuItems = useCallback((): MenuItem[] => {
    return ALL_MENU_ITEMS.filter(item => {
      const allowed = ROUTE_PERMISSIONS[item.path];
      return allowed && allowed.includes(adminRole);
    });
  }, [adminRole]);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const addNotification = useCallback(
    (n: Omit<AdminNotification, "id" | "time" | "read">) => {
      const newNotif: AdminNotification = {
        id: generateId(),
        time: new Date().toLocaleString("zh-CN"),
        read: false,
        ...n,
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications]
  );

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ==========================================
  // AUDIT — Build review queues
  // ==========================================

  const buildReviewQueues = useCallback((): { vouchers: ReviewItem[]; invoices: ReviewItem[] } => {
    const vouchers: ReviewItem[] = [];
    const invoices: ReviewItem[] = [];
    const allUsers: { name?: string; email: string }[] = JSON.parse(localStorage.getItem("paleo_all_users") || "[]");

    for (const u of allUsers) {
      const email = u.email;
      const membershipKey = `paleo_society_membership_${email}`;
      const stored = localStorage.getItem(membershipKey);
      if (stored) {
        const membership = JSON.parse(stored);
        if (membership.status === MEMBERSHIP_STATUS.VOUCHER_SUBMITTED) {
          vouchers.push(buildReviewItem(email, u, "society_fee"));
        } else if (membership.status === MEMBERSHIP_STATUS.INVOICE_SUBMITTED) {
          invoices.push(buildReviewItem(email, u, "society_fee"));
        } else if (membership.status === MEMBERSHIP_STATUS.INVOICE_OVERDUE) {
          invoices.push(buildReviewItem(email, u, "society_fee"));
        }
      }

      const confsKey = `paleo_confs_${email}`;
      const storedConfs = localStorage.getItem(confsKey);
      if (storedConfs) {
        const confRegs = JSON.parse(storedConfs);
        for (const confId of Object.keys(confRegs)) {
          const reg = confRegs[confId];
          if (reg.status === CONFERENCE_STATUS.VOUCHER_SUBMITTED) {
            vouchers.push(buildReviewItem(email, u, "conference_fee", confId));
          } else if (reg.status === CONFERENCE_STATUS.INVOICE_SUBMITTED) {
            invoices.push(buildReviewItem(email, u, "conference_fee", confId));
          } else if (reg.status === CONFERENCE_STATUS.INVOICE_OVERDUE) {
            invoices.push(buildReviewItem(email, u, "conference_fee", confId));
          }
        }
      }
    }

    return { vouchers, invoices };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const { vouchers: pendingVoucherReviews, invoices: pendingInvoiceReviews } = buildReviewQueues();

  // ==========================================
  // AUDIT — Voucher actions
  // ==========================================

  const approveVoucher = useCallback(
    (targetEmail: string, type: "society_fee" | "conference_fee", confId?: string) => {
      if (type === "society_fee") {
        const key = `paleo_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_PENDING;
        membership.invoiceDeadline = addWorkdays(new Date().toISOString().split("T")[0], 7);
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_confs_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const confRegs = JSON.parse(stored);
        if (confRegs[confId]) {
          confRegs[confId].status = CONFERENCE_STATUS.INVOICE_PENDING;
          confRegs[confId].voucherAuditTime = new Date().toISOString();
          confRegs[confId].invoiceDeadline = addWorkdays(new Date().toISOString().split("T")[0], 7);
          localStorage.setItem(key, JSON.stringify(confRegs));
        }
      }
      // Log audit
      const log: AuditLogEntry = {
        id: generateId(),
        targetEmail,
        targetName: targetEmail,
        type,
        action: "approve_voucher",
        reviewer: adminUser?.email || "",
        time: new Date().toISOString(),
      };
      const auditLog: AuditLogEntry[] = JSON.parse(localStorage.getItem("paleo_audit_log") || "[]");
      auditLog.push(log);
      localStorage.setItem("paleo_audit_log", JSON.stringify(auditLog));

      addNotification({
        title: "初审已通过",
        content: `${targetEmail} 的${type === "society_fee" ? "会员费" : "会议费"}凭证初审已通过`,
        type: "success",
      });
      toast.success("初审已通过，已通知用户上传发票");
      triggerRefresh();
    },
    [adminUser, addNotification, triggerRefresh]
  );

  const rejectVoucher = useCallback(
    (targetEmail: string, type: "society_fee" | "conference_fee", reason: string, confId?: string) => {
      if (type === "society_fee") {
        const key = `paleo_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.VOUCHER_REJECTED;
        membership.voucherRejectReason = reason;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_confs_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const confRegs = JSON.parse(stored);
        if (confRegs[confId]) {
          confRegs[confId].status = CONFERENCE_STATUS.VOUCHER_REJECTED;
          confRegs[confId].voucherRejectReason = reason;
          localStorage.setItem(key, JSON.stringify(confRegs));
        }
      }
      addNotification({
        title: "初审已驳回",
        content: `${targetEmail} 的凭证已被驳回，原因：${reason}`,
        type: "warning",
      });
      toast.success("初审已驳回");
      triggerRefresh();
    },
    [addNotification, triggerRefresh]
  );

  const approveInvoice = useCallback(
    (targetEmail: string, type: "society_fee" | "conference_fee", confId?: string) => {
      if (type === "society_fee") {
        const key = `paleo_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.ACTIVE;
        membership.expiryDate = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_confs_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const confRegs = JSON.parse(stored);
        if (confRegs[confId]) {
          confRegs[confId].status = CONFERENCE_STATUS.CONFIRMED;
          confRegs[confId].invoiceAuditTime = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(confRegs));
        }
      }
      addNotification({
        title: "终审已通过",
        content: `${targetEmail} 的${type === "society_fee" ? "会员费" : "会议费"}终审已通过`,
        type: "success",
      });
      toast.success("终审已通过");
      triggerRefresh();
    },
    [addNotification, triggerRefresh]
  );

  const rejectInvoice = useCallback(
    (targetEmail: string, type: "society_fee" | "conference_fee", reason: string, confId?: string) => {
      if (type === "society_fee") {
        const key = `paleo_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_REJECTED;
        membership.invoiceRejectReason = reason;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_confs_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const confRegs = JSON.parse(stored);
        if (confRegs[confId]) {
          confRegs[confId].status = CONFERENCE_STATUS.INVOICE_REJECTED;
          confRegs[confId].invoiceRejectReason = reason;
          localStorage.setItem(key, JSON.stringify(confRegs));
        }
      }
      addNotification({
        title: "终审已驳回",
        content: `${targetEmail} 的发票已被驳回，原因：${reason}`,
        type: "warning",
      });
      toast.success("终审已驳回");
      triggerRefresh();
    },
    [addNotification, triggerRefresh]
  );

  // ==========================================
  // AUDIT — Batch operations
  // ==========================================

  const batchApproveVoucher = useCallback(
    (ids: string[]) => {
      const { vouchers } = buildReviewQueues();
      const toApprove = vouchers.filter(v => ids.includes(v.id));
      for (const item of toApprove) {
        approveVoucher(item.userEmail, item.type, item.confId);
      }
      toast.success(`已批量通过 ${toApprove.length} 条初审`);
    },
    [buildReviewQueues, approveVoucher]
  );

  const batchRejectVoucher = useCallback(
    (ids: string[], reason: string) => {
      const { vouchers } = buildReviewQueues();
      const toReject = vouchers.filter(v => ids.includes(v.id));
      for (const item of toReject) {
        rejectVoucher(item.userEmail, item.type, reason, item.confId);
      }
      toast.success(`已批量驳回 ${toReject.length} 条初审`);
    },
    [buildReviewQueues, rejectVoucher]
  );

  const batchApproveInvoice = useCallback(
    (ids: string[]) => {
      const { invoices } = buildReviewQueues();
      const toApprove = invoices.filter(v => ids.includes(v.id));
      for (const item of toApprove) {
        approveInvoice(item.userEmail, item.type, item.confId);
      }
      toast.success(`已批量通过 ${toApprove.length} 条终审`);
    },
    [buildReviewQueues, approveInvoice]
  );

  const batchRejectInvoice = useCallback(
    (ids: string[], reason: string) => {
      const { invoices } = buildReviewQueues();
      const toReject = invoices.filter(v => ids.includes(v.id));
      for (const item of toReject) {
        rejectInvoice(item.userEmail, item.type, reason, item.confId);
      }
      toast.success(`已批量驳回 ${toReject.length} 条终审`);
    },
    [buildReviewQueues, rejectInvoice]
  );

  const extendDeadline = useCallback(
    (targetEmail: string, type: "society_fee" | "conference_fee", newDeadline: string, reason: string, confId?: string) => {
      if (type === "society_fee") {
        const key = `paleo_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_PENDING;
        membership.invoiceExtendedDeadline = newDeadline;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_confs_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const confRegs = JSON.parse(stored);
        if (confRegs[confId]) {
          confRegs[confId].status = CONFERENCE_STATUS.INVOICE_PENDING;
          confRegs[confId].invoiceExtendedDeadline = newDeadline;
          localStorage.setItem(key, JSON.stringify(confRegs));
        }
      }
      addNotification({
        title: "已延期",
        content: `${targetEmail} 的上传期限已延至 ${newDeadline}，理由：${reason}`,
        type: "info",
      });
      toast.success(`已延期至 ${newDeadline}`);
      triggerRefresh();
    },
    [addNotification, triggerRefresh]
  );

  // ==========================================
  // MEMBER MANAGEMENT
  // ==========================================

  const getAllMembers = useCallback((filters?: MemberFilter): MemberRecord[] => {
    const allUsers: { email: string; name?: string; gender?: string; unit?: string; role?: string; memberType?: string }[] =
      JSON.parse(localStorage.getItem("paleo_all_users") || "[]");

    const members: MemberRecord[] = allUsers.map(u => {
      const key = `paleo_society_membership_${u.email}`;
      const stored = localStorage.getItem(key);
      const membership = stored ? JSON.parse(stored) : { status: "not_member", history: [] };
      const branchesKey = `paleo_bound_branches_${u.email}`;
      const storedBranches = localStorage.getItem(branchesKey);
      const boundBranches: string[] = storedBranches ? JSON.parse(storedBranches) : [];
      const typeKey = `paleo_user_type_${u.email}`;
      const userType = localStorage.getItem(typeKey) || "regular";

      return {
        email: u.email,
        name: u.name || "",
        gender: u.gender || "",
        unit: u.unit || "",
        role: u.role || "",
        memberType: u.memberType,
        membershipStatus: membership.status || "not_member",
        boundBranches: Array.isArray(boundBranches) ? boundBranches : [],
        expiryDate: membership.expiryDate,
        userType,
        disabled: membership.status === MEMBERSHIP_STATUS.EXPIRED,
      };
    });

    let filtered = members;
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(m => m.email.toLowerCase().includes(s) || m.name.includes(s));
    }
    if (filters?.status) {
      filtered = filtered.filter(m => m.membershipStatus === filters.status);
    }
    if (filters?.branchId) {
      filtered = filtered.filter(m => m.boundBranches.includes(filters.branchId!));
    }
    return filtered;
  }, []);

  const getMemberDetail = useCallback((email: string): MemberDetail | null => {
    const members = getAllMembers();
    const member = members.find(m => m.email === email);
    if (!member) return null;
    const key = `paleo_society_membership_${email}`;
    const stored = localStorage.getItem(key);
    const membership = stored ? JSON.parse(stored) : { history: [] };
    const notifsKey = `paleo_notifs_${email}`;
    const storedNotifs = localStorage.getItem(notifsKey);
    const userNotifs: AdminNotification[] = storedNotifs ? JSON.parse(storedNotifs) : [];
    return {
      ...member,
      paymentHistory: membership.history || [],
      notifications: userNotifs,
    };
  }, [getAllMembers]);

  const toggleMemberDisabled = useCallback((email: string) => {
    const key = `paleo_society_membership_${email}`;
    const stored = localStorage.getItem(key);
    if (!stored) { toast.error("未找到该会员记录"); return; }
    const membership = JSON.parse(stored);
    if (membership.status === MEMBERSHIP_STATUS.ACTIVE) {
      membership.status = MEMBERSHIP_STATUS.EXPIRED;
      toast.success(`已禁用 ${email} 的会员资格`);
    } else if (membership.status === MEMBERSHIP_STATUS.EXPIRED) {
      membership.status = MEMBERSHIP_STATUS.ACTIVE;
      toast.success(`已启用 ${email} 的会员资格`);
    } else {
      toast.error("只能对已开通或已过期会员执行此操作");
      return;
    }
    localStorage.setItem(key, JSON.stringify(membership));
    triggerRefresh();
  }, [triggerRefresh]);

  const manualActivateMember = useCallback((email: string) => {
    const key = `paleo_society_membership_${email}`;
    const stored = localStorage.getItem(key);
    const membership = stored ? JSON.parse(stored) : { status: "not_member", history: [] };
    membership.status = MEMBERSHIP_STATUS.ACTIVE;
    membership.expiryDate = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];
    localStorage.setItem(key, JSON.stringify(membership));
    toast.success(`${email} 已手动开通会员`);
    triggerRefresh();
  }, [triggerRefresh]);

  // ==========================================
  // CONFERENCE MANAGEMENT
  // ==========================================

  const getAllConferences = useCallback((): ConferenceRecord[] => {
    const stored = localStorage.getItem("paleo_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const allUsers: { email: string }[] = JSON.parse(localStorage.getItem("paleo_all_users") || "[]");
    return confs.map((c: ConferenceRecord) => {
      let count = 0;
      for (const u of allUsers) {
        const confsKey = `paleo_confs_${u.email}`;
        const storedConfs = localStorage.getItem(confsKey);
        if (!storedConfs) continue;
        const regs = JSON.parse(storedConfs);
        if (regs[c.id]) count++;
      }
      return { ...c, registrations: count };
    });
  }, []);

  const getBranchConferences = useCallback(
    (branchId: string): ConferenceRecord[] => {
      const all = getAllConferences();
      return all.filter(c => c.branchId === branchId);
    },
    [getAllConferences]
  );

  const createConference = useCallback((data: ConferenceData) => {
    const stored = localStorage.getItem("paleo_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const newConf: ConferenceRecord = {
      ...data,
      id: `conf-${Date.now()}`,
      branchName: BRANCH_MAP[data.branchId] || data.branchId,
      registrations: 0,
    };
    confs.push(newConf);
    localStorage.setItem("paleo_conferences_db", JSON.stringify(confs));
    // Sync fee config
    const feeMap = JSON.parse(localStorage.getItem("paleo_conference_fee_config") || "{}");
    feeMap[newConf.id] = data.memberFee;
    localStorage.setItem("paleo_conference_fee_config", JSON.stringify(feeMap));
    toast.success("会议创建成功");
    triggerRefresh();
  }, [triggerRefresh]);

  const updateConference = useCallback((id: string, data: ConferenceData) => {
    const stored = localStorage.getItem("paleo_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const idx = confs.findIndex((c: ConferenceRecord) => c.id === id);
    if (idx >= 0) {
      confs[idx] = { ...confs[idx], ...data, branchName: BRANCH_MAP[data.branchId] || data.branchId };
      localStorage.setItem("paleo_conferences_db", JSON.stringify(confs));
      toast.success("会议更新成功");
      triggerRefresh();
    }
  }, [triggerRefresh]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const getDashboardStats = useCallback((): DashboardStats => {
    const members = getAllMembers();
    const { vouchers, invoices } = buildReviewQueues();
    const confs = getAllConferences();
    const branchCounts = Object.entries(BRANCH_MAP).map(([, name]) => ({
      name,
      count: members.filter(m => m.boundBranches.includes(name)).length,
    }));
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.membershipStatus === MEMBERSHIP_STATUS.ACTIVE).length,
      pendingReviews: vouchers.length + invoices.length,
      activeConferences: confs.filter(c => c.status === "published").length,
      recentReviews: [...vouchers, ...invoices].slice(0, 5),
      branchMemberCounts: branchCounts,
      paymentTrend: [],
    };
  }, [getAllMembers, buildReviewQueues, getAllConferences]);

  const getBranchDashboardStats = useCallback((branchId: string): BranchDashboardStats => {
    const confs = getAllConferences().filter(c => c.branchId === branchId);
    const members = getAllMembers().filter(m => m.boundBranches.includes(branchId));
    const { vouchers } = buildReviewQueues();
    return {
      branchConferences: confs.length,
      branchRegistrations: confs.reduce((sum, c) => sum + c.registrations, 0),
      branchPendingReviews: vouchers.length,
      branchMemberCount: members.length,
      recentRegistrations: [],
    };
  }, [getAllConferences, getAllMembers, buildReviewQueues]);

  const getFinanceDashboardStats = useCallback((): FinanceDashboardStats => {
    const { vouchers, invoices } = buildReviewQueues();
    const auditLog: AuditLogEntry[] = JSON.parse(localStorage.getItem("paleo_audit_log") || "[]");
    const today = new Date().toISOString().split("T")[0];
    const todayActions = auditLog.filter(l => l.time.startsWith(today));
    return {
      pendingVoucher: vouchers.length,
      pendingInvoice: invoices.length,
      processedToday: todayActions.length,
      overdueCount: invoices.filter(i => i.status === "invoice_overdue").length,
      voucherPassRate: 0,
      invoicePassRate: 0,
      recentReviews: [...vouchers, ...invoices].slice(0, 10),
    };
  }, [buildReviewQueues]);

  // ==========================================
  // FINANCE RECORDS
  // ==========================================

  const getAllPaymentRecords = useCallback((): ReviewItem[] => {
    const allUsers: { name?: string; email: string }[] = JSON.parse(localStorage.getItem("paleo_all_users") || "[]");
    const records: ReviewItem[] = [];
    for (const u of allUsers) {
      const key = `paleo_society_membership_${u.email}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const membership = JSON.parse(stored);
        if (membership.status && membership.status !== "not_member") {
          records.push(buildReviewItem(u.email, u, "society_fee"));
        }
      }
      const confsKey = `paleo_confs_${u.email}`;
      const storedConfs = localStorage.getItem(confsKey);
      if (storedConfs) {
        const confRegs = JSON.parse(storedConfs);
        for (const confId of Object.keys(confRegs)) {
          if (confRegs[confId].status && confRegs[confId].status !== "unpaid") {
            records.push(buildReviewItem(u.email, u, "conference_fee", confId));
          }
        }
      }
    }
    return records;
  }, []);

  // ==========================================
  // BRANCH MANAGEMENT
  // ==========================================

  const getAllBranches = useCallback((): BranchRecord[] => {
    const stored = localStorage.getItem("paleo_branches_db");
    if (stored) return JSON.parse(stored);
    const members = getAllMembers();
    return Object.entries(BRANCH_MAP).map(([id, name]) => ({
      id,
      name,
      description: `${name}是中国古生物学会下属专业分会`,
      memberCount: members.filter(m => m.boundBranches.includes(id)).length,
      disabled: false,
    }));
  }, [getAllMembers]);

  const updateBranch = useCallback((id: string, data: Partial<BranchRecord>) => {
    const branches = getAllBranches();
    const idx = branches.findIndex(b => b.id === id);
    if (idx >= 0) {
      branches[idx] = { ...branches[idx], ...data };
      localStorage.setItem("paleo_branches_db", JSON.stringify(branches));
      toast.success("分会信息已更新");
      triggerRefresh();
    }
  }, [getAllBranches, triggerRefresh]);

  const toggleBranchDisabled = useCallback((id: string) => {
    const branches = getAllBranches();
    const idx = branches.findIndex(b => b.id === id);
    if (idx >= 0) {
      branches[idx].disabled = !branches[idx].disabled;
      localStorage.setItem("paleo_branches_db", JSON.stringify(branches));
      toast.success(branches[idx].disabled ? "分会已禁用" : "分会已启用");
      triggerRefresh();
    }
  }, [getAllBranches, triggerRefresh]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue: AdminContextType = {
    adminUser,
    isAdminLoggedIn: !!adminUser,
    adminLogin,
    adminLogout,
    adminRole,
    adminBranchId,
    canAccess,
    getAllowedMenuItems,
    pendingVoucherReviews,
    pendingInvoiceReviews,
    approveVoucher,
    rejectVoucher,
    approveInvoice,
    rejectInvoice,
    batchApproveVoucher,
    batchRejectVoucher,
    batchApproveInvoice,
    batchRejectInvoice,
    extendDeadline,
    getAllMembers,
    getMemberDetail,
    toggleMemberDisabled,
    manualActivateMember,
    getAllConferences,
    getBranchConferences,
    createConference,
    updateConference,
    getDashboardStats,
    getBranchDashboardStats,
    getFinanceDashboardStats,
    getAllPaymentRecords,
    getAllBranches,
    updateBranch,
    toggleBranchDisabled,
    notifications,
    addNotification,
    markAllRead,
    unreadCount,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
