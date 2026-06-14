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
  children?: MenuItem[];
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
  totalUsers: number;
  nonMemberCount: number;
  memberCount: number;
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
  branchUserCount: number;
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
  "/admin/users/non-members": ["super_admin"],
  "/admin/users/members": ["super_admin"],
  "/admin/conferences": ["super_admin", "branch_admin"],
  "/admin/statistics": ["super_admin", "branch_admin"],
  "/admin/finance": ["super_admin", "finance_reviewer"],
  "/admin/branches": ["super_admin"],
};

const ALL_MENU_ITEMS: MenuItem[] = [
  { path: "/admin/dashboard", label: "首页仪表盘", icon: "LayoutDashboard" },
  { path: "/admin/audit", label: "审核工作台", icon: "ClipboardCheck" },
  {
    path: "/admin/users",
    label: "用户管理",
    icon: "Users",
    children: [
      { path: "/admin/users/non-members", label: "非会员用户管理", icon: "User" },
      { path: "/admin/users/members", label: "会员用户管理", icon: "UserCheck" },
    ],
  },
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
  const membershipKey = `paleo_admin_society_membership_${email}`;
  const storedMembership = localStorage.getItem(membershipKey);
  const membership = storedMembership ? JSON.parse(storedMembership) : null;
  const confsKey = `paleo_admin_confs_${email}`;
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
// DEMO DATA SEED — populates localStorage with realistic mock data on first load
// so the admin panel shows meaningful data even before the frontend is used.
// ============================================================================

interface SeedUser {
  email: string;
  password: string;
  name: string;
  gender: string;
  unit: string;
  role: string;
  title?: string;
  memberType?: string;
}

interface SeedMembership {
  status: string;
  expiryDate?: string;
  history: {
    id: string;
    type: string;
    targetName: string;
    amount: number;
    voucherUrl: string;
    invoiceUrl?: string;
    submitTime: string;
    auditTime?: string;
    status: string;
  }[];
  voucherRejectReason?: string;
  invoiceRejectReason?: string;
  invoiceDeadline?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: "demo@paleontology.org.cn",
    password: "demo123",
    name: "演示用户",
    gender: "男",
    unit: "中国古生物学会",
    role: "教师",
    title: "高级工程师",
    memberType: "普通会员",
  },
  {
    email: "member@paleontology.org.cn",
    password: "password123",
    name: "张华",
    gender: "男",
    unit: "中国科学院古脊椎动物与古人类研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "student@paleontology.org.cn",
    password: "password123",
    name: "李萌",
    gender: "女",
    unit: "南京大学地科院",
    role: "学生",
    title: "硕士研究生",
    memberType: "普通会员",
  },
  {
    email: "wangli@paleontology.org.cn",
    password: "password123",
    name: "王莉",
    gender: "女",
    unit: "北京大学地球与空间科学学院",
    role: "教师",
    title: "副教授",
    memberType: "普通会员",
  },
  {
    email: "zhaoqiang@paleontology.org.cn",
    password: "password123",
    name: "赵强",
    gender: "男",
    unit: "中国地质大学（武汉）",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  // ── 古脊椎动物学分会 (gjzdw) — 补充用户 ──
  {
    email: "chenming@paleontology.org.cn",
    password: "password123",
    name: "陈明",
    gender: "男",
    unit: "中国科学院古脊椎动物与古人类研究所",
    role: "教师",
    title: "副研究员",
    memberType: "普通会员",
  },
  {
    email: "liuxia@paleontology.org.cn",
    password: "password123",
    name: "刘霞",
    gender: "女",
    unit: "西北大学地质学系",
    role: "教师",
    title: "教授",
    memberType: "普通会员",
  },
  {
    email: "zhouwei@paleontology.org.cn",
    password: "password123",
    name: "周伟",
    gender: "男",
    unit: "云南大学古生物研究院",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  {
    email: "sunfang@paleontology.org.cn",
    password: "password123",
    name: "孙芳",
    gender: "女",
    unit: "北京自然博物馆",
    role: "教师",
    title: "馆员",
    memberType: "普通会员",
  },
  {
    email: "wulei@paleontology.org.cn",
    password: "password123",
    name: "吴磊",
    gender: "男",
    unit: "中国地质科学院",
    role: "学生",
    title: "硕士研究生",
    memberType: "普通会员",
  },
  // ── 微体学分会 (wtxfh) — 补充用户 ──
  {
    email: "huangjing@paleontology.org.cn",
    password: "password123",
    name: "黄静",
    gender: "女",
    unit: "南京地质古生物研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "mayun@paleontology.org.cn",
    password: "password123",
    name: "马云",
    gender: "男",
    unit: "同济大学海洋地质国家重点实验室",
    role: "教师",
    title: "副教授",
    memberType: "普通会员",
  },
  {
    email: "linjia@paleontology.org.cn",
    password: "password123",
    name: "林佳",
    gender: "女",
    unit: "中国石油大学（华东）",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  {
    email: "zhengtao@paleontology.org.cn",
    password: "password123",
    name: "郑涛",
    gender: "男",
    unit: "北京大学地球与空间科学学院",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  // ── 古植物学分会 (gzwxfh) — 补充用户 ──
  {
    email: "heping@paleontology.org.cn",
    password: "password123",
    name: "何平",
    gender: "男",
    unit: "中国科学院植物研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "gaoyuan@paleontology.org.cn",
    password: "password123",
    name: "高远",
    gender: "男",
    unit: "吉林大学古生物学与地层学研究中心",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  {
    email: "duanli@paleontology.org.cn",
    password: "password123",
    name: "段丽",
    gender: "女",
    unit: "兰州大学地质科学与矿产资源学院",
    role: "教师",
    title: "副教授",
    memberType: "普通会员",
  },
  // ── 孢粉学分会 (bfxfh) — 补充用户 ──
  {
    email: "xuyang@paleontology.org.cn",
    password: "password123",
    name: "徐洋",
    gender: "男",
    unit: "中国科学院植物研究所",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  {
    email: "caijie@paleontology.org.cn",
    password: "password123",
    name: "蔡洁",
    gender: "女",
    unit: "中山大学地球科学与工程学院",
    role: "教师",
    title: "教授",
    memberType: "普通会员",
  },
  {
    email: "fangyi@paleontology.org.cn",
    password: "password123",
    name: "方毅",
    gender: "男",
    unit: "中国地质科学院水文地质环境地质研究所",
    role: "教师",
    title: "高级工程师",
    memberType: "普通会员",
  },
  // ── 地球生物学分会 (dqswx) — 补充用户 ──
  {
    email: "huxue@paleontology.org.cn",
    password: "password123",
    name: "胡雪",
    gender: "女",
    unit: "中国地质大学（武汉）",
    role: "教师",
    title: "教授",
    memberType: "普通会员",
  },
  {
    email: "jiangbo@paleontology.org.cn",
    password: "password123",
    name: "江波",
    gender: "男",
    unit: "成都理工大学沉积地质研究院",
    role: "学生",
    title: "硕士研究生",
    memberType: "普通会员",
  },
  {
    email: "qinyi@paleontology.org.cn",
    password: "password123",
    name: "秦怡",
    gender: "女",
    unit: "西北大学地质学系",
    role: "教师",
    title: "讲师",
    memberType: "普通会员",
  },
  // ── 古生态专业分会 (gst) — 补充用户 ──
  {
    email: "shilei@paleontology.org.cn",
    password: "password123",
    name: "石磊",
    gender: "男",
    unit: "中国科学院南京地质古生物研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "panshan@paleontology.org.cn",
    password: "password123",
    name: "潘珊",
    gender: "女",
    unit: "云南大学地球科学学院",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  // ── 生物沉积学分会 (swcj) — 补充用户 ──
  {
    email: "luojun@paleontology.org.cn",
    password: "password123",
    name: "罗军",
    gender: "男",
    unit: "中国矿业大学资源与地球科学学院",
    role: "教师",
    title: "副教授",
    memberType: "普通会员",
  },
  // ── 古无脊椎动物学分会 (gwjzdwxfh) ──
  {
    email: "tangwei@paleontology.org.cn",
    password: "password123",
    name: "唐伟",
    gender: "男",
    unit: "中国科学院南京地质古生物研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "renjie@paleontology.org.cn",
    password: "password123",
    name: "任杰",
    gender: "男",
    unit: "中国地质科学院地质研究所",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
  {
    email: "yujuan@paleontology.org.cn",
    password: "password123",
    name: "于娟",
    gender: "女",
    unit: "贵州大学资源与环境工程学院",
    role: "教师",
    title: "教授",
    memberType: "普通会员",
  },
  // ── 科普工作委员会 (kpgzwyh) ──
  {
    email: "xurui@paleontology.org.cn",
    password: "password123",
    name: "许瑞",
    gender: "男",
    unit: "北京自然博物馆",
    role: "教师",
    title: "副研究馆员",
    memberType: "普通会员",
  },
  {
    email: "konglin@paleontology.org.cn",
    password: "password123",
    name: "孔琳",
    gender: "女",
    unit: "上海自然博物馆",
    role: "教师",
    title: "馆员",
    memberType: "普通会员",
  },
  // ── 化石藻类专业委员会 (hszlzwyh) ──
  {
    email: "mengfei@paleontology.org.cn",
    password: "password123",
    name: "孟菲",
    gender: "女",
    unit: "中国地质大学（北京）",
    role: "教师",
    title: "副教授",
    memberType: "普通会员",
  },
  {
    email: "songyang@paleontology.org.cn",
    password: "password123",
    name: "宋洋",
    gender: "男",
    unit: "长江大学地球科学学院",
    role: "学生",
    title: "硕士研究生",
    memberType: "普通会员",
  },
  // ── 新技术新方法专业委员会 (xjsxff) ──
  {
    email: "bailing@paleontology.org.cn",
    password: "password123",
    name: "白玲",
    gender: "女",
    unit: "中国科学院地质与地球物理研究所",
    role: "教师",
    title: "研究员",
    memberType: "普通会员",
  },
  {
    email: "guodong@paleontology.org.cn",
    password: "password123",
    name: "郭东",
    gender: "男",
    unit: "浙江大学地球科学学院",
    role: "学生",
    title: "博士研究生",
    memberType: "普通会员",
  },
];

function makeActiveMembership(amount: number, submitDate: string): SeedMembership {
  return {
    status: "active",
    expiryDate: "2026-12-31",
    history: [
      {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "society_fee",
        targetName: "中国古生物学会会员费",
        amount,
        voucherUrl: "",
        submitTime: submitDate,
        auditTime: submitDate.replace(/\d{2}:\d{2}$/, "09:00"),
        status: "active",
      },
    ],
  };
}

function makeStudentMembership(amount: number, submitDate: string): SeedMembership {
  return {
    status: "active",
    expiryDate: "2026-12-31",
    history: [
      {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "society_fee",
        targetName: "中国古生物学会会员费",
        amount,
        voucherUrl: "",
        submitTime: submitDate,
        auditTime: submitDate.replace(/\d{2}:\d{2}$/, "09:00"),
        status: "active",
      },
    ],
  };
}

const SEED_MEMBERSHIPS: Record<string, SeedMembership> = {
  // 演示用户 — 非会员（路径A）
  "demo@paleontology.org.cn": {
    status: "not_member",
    history: [],
  },
  // 张华 — 有效会员
  "member@paleontology.org.cn": makeActiveMembership(200, "2026-03-15 14:30"),
  // 李萌 — 凭证初审中
  "student@paleontology.org.cn": {
    status: "voucher_submitted",
    history: [
      {
        id: "pay-stu-1",
        type: "society_fee",
        targetName: "中国古生物学会会员费",
        amount: 100,
        voucherUrl: "",
        submitTime: "2026-06-10 10:20",
        status: "voucher_submitted",
      },
    ],
  },
  // 王莉 — 待上传发票
  "wangli@paleontology.org.cn": {
    status: "invoice_pending",
    invoiceDeadline: "2026-06-21",
    history: [
      {
        id: "pay-wl-1",
        type: "society_fee",
        targetName: "中国古生物学会会员费",
        amount: 200,
        voucherUrl: "",
        submitTime: "2026-06-08 09:00",
        auditTime: "2026-06-10 14:00",
        status: "invoice_pending",
      },
    ],
  },
  // 赵强 — 已过期
  "zhaoqiang@paleontology.org.cn": {
    status: "expired",
    expiryDate: "2025-12-31",
    history: [
      {
        id: "pay-zq-1",
        type: "society_fee",
        targetName: "中国古生物学会会员费",
        amount: 100,
        voucherUrl: "",
        submitTime: "2025-01-10 11:00",
        auditTime: "2025-01-12 08:30",
        status: "active",
      },
    ],
  },
  // ── 古脊椎动物学分会补充 ──
  "chenming@paleontology.org.cn": makeActiveMembership(200, "2026-02-20 15:00"),
  "liuxia@paleontology.org.cn": makeActiveMembership(200, "2026-01-08 10:30"),
  "zhouwei@paleontology.org.cn": makeStudentMembership(100, "2026-04-12 16:45"),
  "sunfang@paleontology.org.cn": makeActiveMembership(200, "2026-05-03 09:15"),
  "wulei@paleontology.org.cn": makeStudentMembership(100, "2026-03-28 11:00"),
  // ── 微体学分会补充 ──
  "huangjing@paleontology.org.cn": makeActiveMembership(200, "2026-02-14 08:20"),
  "mayun@paleontology.org.cn": makeActiveMembership(200, "2026-04-01 13:10"),
  "linjia@paleontology.org.cn": makeStudentMembership(100, "2026-05-18 10:50"),
  "zhengtao@paleontology.org.cn": makeActiveMembership(200, "2026-01-22 14:00"),
  // ── 古植物学分会补充 ──
  "heping@paleontology.org.cn": makeActiveMembership(200, "2026-03-05 09:30"),
  "gaoyuan@paleontology.org.cn": makeStudentMembership(100, "2026-05-25 15:20"),
  "duanli@paleontology.org.cn": makeActiveMembership(200, "2026-02-18 11:45"),
  // ── 孢粉学分会补充 ──
  "xuyang@paleontology.org.cn": makeStudentMembership(100, "2026-04-08 10:00"),
  "caijie@paleontology.org.cn": makeActiveMembership(200, "2026-01-30 08:40"),
  "fangyi@paleontology.org.cn": makeActiveMembership(200, "2026-03-12 16:30"),
  // ── 地球生物学分会补充 ──
  "huxue@paleontology.org.cn": makeActiveMembership(200, "2026-02-22 09:50"),
  "jiangbo@paleontology.org.cn": makeStudentMembership(100, "2026-06-02 14:15"),
  "qinyi@paleontology.org.cn": makeActiveMembership(200, "2026-04-16 10:35"),
  // ── 古生态专业分会补充 ──
  "shilei@paleontology.org.cn": makeActiveMembership(200, "2026-01-15 08:10"),
  "panshan@paleontology.org.cn": makeStudentMembership(100, "2026-05-08 13:25"),
  // ── 生物沉积学分会补充 ──
  "luojun@paleontology.org.cn": makeActiveMembership(200, "2026-03-20 09:55"),
  // ── 古无脊椎动物学分会 ──
  "tangwei@paleontology.org.cn": makeActiveMembership(200, "2026-02-28 14:40"),
  "renjie@paleontology.org.cn": makeStudentMembership(100, "2026-04-22 11:05"),
  "yujuan@paleontology.org.cn": makeActiveMembership(200, "2026-01-18 15:30"),
  // ── 科普工作委员会 ──
  "xurui@paleontology.org.cn": makeActiveMembership(200, "2026-05-12 08:55"),
  "konglin@paleontology.org.cn": makeActiveMembership(200, "2026-03-08 10:15"),
  // ── 化石藻类专业委员会 ──
  "mengfei@paleontology.org.cn": makeActiveMembership(200, "2026-04-05 13:50"),
  "songyang@paleontology.org.cn": makeStudentMembership(100, "2026-06-05 09:20"),
  // ── 新技术新方法专业委员会 ──
  "bailing@paleontology.org.cn": makeActiveMembership(200, "2026-02-10 11:30"),
  "guodong@paleontology.org.cn": makeStudentMembership(100, "2026-05-30 16:00"),
};

const SEED_BRANCH_BINDINGS: Record<string, string[]> = {
  // 原有用户
  "demo@paleontology.org.cn": ["gjzdw", "wtxfh"],
  "member@paleontology.org.cn": ["gjzdw", "gzwxfh", "bfxfh"],
  "student@paleontology.org.cn": ["gst", "dqswx"],
  "wangli@paleontology.org.cn": ["wtxfh", "gzwxfh", "swcj"],
  "zhaoqiang@paleontology.org.cn": ["gjzdw"],
  // ── 古脊椎动物学分会 (gjzdw) — 目标 ~8 人 ──
  "chenming@paleontology.org.cn": ["gjzdw"],
  "liuxia@paleontology.org.cn": ["gjzdw", "gzwxfh"],
  "zhouwei@paleontology.org.cn": ["gjzdw"],
  "sunfang@paleontology.org.cn": ["gjzdw", "kpgzwyh"],
  "wulei@paleontology.org.cn": ["gjzdw"],
  // ── 微体学分会 (wtxfh) — 目标 ~6 人 ──
  "huangjing@paleontology.org.cn": ["wtxfh", "hszlzwyh"],
  "mayun@paleontology.org.cn": ["wtxfh"],
  "linjia@paleontology.org.cn": ["wtxfh"],
  "zhengtao@paleontology.org.cn": ["wtxfh", "dqswx"],
  // ── 古植物学分会 (gzwxfh) — 目标 ~5 人 ──
  "heping@paleontology.org.cn": ["gzwxfh"],
  "gaoyuan@paleontology.org.cn": ["gzwxfh"],
  "duanli@paleontology.org.cn": ["gzwxfh", "bfxfh"],
  // ── 孢粉学分会 (bfxfh) — 目标 ~4 人 ──
  "xuyang@paleontology.org.cn": ["bfxfh"],
  "caijie@paleontology.org.cn": ["bfxfh"],
  "fangyi@paleontology.org.cn": ["bfxfh", "wtxfh"],
  // ── 地球生物学分会 (dqswx) — 目标 ~4 人 ──
  "huxue@paleontology.org.cn": ["dqswx"],
  "jiangbo@paleontology.org.cn": ["dqswx"],
  "qinyi@paleontology.org.cn": ["dqswx", "gst"],
  // ── 古生态专业分会 (gst) — 目标 ~3 人 ──
  "shilei@paleontology.org.cn": ["gst"],
  "panshan@paleontology.org.cn": ["gst", "gjzdw"],
  // ── 生物沉积学分会 (swcj) — 目标 ~2 人 ──
  "luojun@paleontology.org.cn": ["swcj"],
  // ── 古无脊椎动物学分会 (gwjzdwxfh) — 目标 ~3 人 ──
  "tangwei@paleontology.org.cn": ["gwjzdwxfh"],
  "renjie@paleontology.org.cn": ["gwjzdwxfh"],
  "yujuan@paleontology.org.cn": ["gwjzdwxfh", "dqswx"],
  // ── 科普工作委员会 (kpgzwyh) — 目标 ~2 人 ──
  "xurui@paleontology.org.cn": ["kpgzwyh"],
  "konglin@paleontology.org.cn": ["kpgzwyh", "gjzdw"],
  // ── 化石藻类专业委员会 (hszlzwyh) — 目标 ~2 人 ──
  "mengfei@paleontology.org.cn": ["hszlzwyh"],
  "songyang@paleontology.org.cn": ["hszlzwyh"],
  // ── 新技术新方法专业委员会 (xjsxff) — 目标 ~2 人 ──
  "bailing@paleontology.org.cn": ["xjsxff"],
  "guodong@paleontology.org.cn": ["xjsxff", "wtxfh"],
};

const SEED_USER_TYPES: Record<string, string> = {
  "demo@paleontology.org.cn": "non_member",
  "member@paleontology.org.cn": "member",
  "student@paleontology.org.cn": "member",
  "wangli@paleontology.org.cn": "member",
  "zhaoqiang@paleontology.org.cn": "member",
  "chenming@paleontology.org.cn": "member",
  "liuxia@paleontology.org.cn": "member",
  "zhouwei@paleontology.org.cn": "member",
  "sunfang@paleontology.org.cn": "member",
  "wulei@paleontology.org.cn": "member",
  "huangjing@paleontology.org.cn": "member",
  "mayun@paleontology.org.cn": "member",
  "linjia@paleontology.org.cn": "member",
  "zhengtao@paleontology.org.cn": "member",
  "heping@paleontology.org.cn": "member",
  "gaoyuan@paleontology.org.cn": "member",
  "duanli@paleontology.org.cn": "member",
  "xuyang@paleontology.org.cn": "member",
  "caijie@paleontology.org.cn": "member",
  "fangyi@paleontology.org.cn": "member",
  "huxue@paleontology.org.cn": "member",
  "jiangbo@paleontology.org.cn": "member",
  "qinyi@paleontology.org.cn": "member",
  "shilei@paleontology.org.cn": "member",
  "panshan@paleontology.org.cn": "member",
  "luojun@paleontology.org.cn": "member",
  "tangwei@paleontology.org.cn": "member",
  "renjie@paleontology.org.cn": "member",
  "yujuan@paleontology.org.cn": "member",
  "xurui@paleontology.org.cn": "member",
  "konglin@paleontology.org.cn": "member",
  "mengfei@paleontology.org.cn": "member",
  "songyang@paleontology.org.cn": "member",
  "bailing@paleontology.org.cn": "member",
  "guodong@paleontology.org.cn": "member",
};

function seedDemoData() {
  // Only seed if no user data exists yet
  if (localStorage.getItem("paleo_admin_all_users")) return;

  // 1. Write user DB (credentials)
  localStorage.setItem("paleo_admin_user_db", JSON.stringify(SEED_USERS));

  // 2. Write all users list (without passwords)
  const allUsers = SEED_USERS.map(({ password, ...u }) => u);
  localStorage.setItem("paleo_admin_all_users", JSON.stringify(allUsers));

  // 3. Write membership data per user
  for (const [email, membership] of Object.entries(SEED_MEMBERSHIPS)) {
    localStorage.setItem(`paleo_admin_society_membership_${email}`, JSON.stringify(membership));
  }

  // 4. Write branch bindings
  for (const [email, branches] of Object.entries(SEED_BRANCH_BINDINGS)) {
    localStorage.setItem(`paleo_admin_bound_branches_${email}`, JSON.stringify(branches));
  }

  // 5. Write user types
  for (const [email, userType] of Object.entries(SEED_USER_TYPES)) {
    localStorage.setItem(`paleo_admin_user_type_${email}`, userType);
  }

  // 6. Write choice-made flag so users don't see the choice dialog
  for (const email of Object.keys(SEED_USER_TYPES)) {
    localStorage.setItem(`paleo_admin_choice_made_${email}`, "true");
  }

  console.log(`[Admin] Seeded demo data: ${SEED_USERS.length} users across ${Object.keys(BRANCH_MAP).length} branches`);
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
    if (!localStorage.getItem("paleo_admin_conferences_db")) {
      localStorage.setItem("paleo_admin_conferences_db", JSON.stringify(DEFAULT_CONFERENCES));
    }
    // Seed demo data so admin panel has realistic data on first load
    seedDemoData();
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
    return ALL_MENU_ITEMS
      .map(item => {
        // If item has children, filter children by permission
        if (item.children && item.children.length > 0) {
          const allowedChildren = item.children.filter(child => {
            const allowed = ROUTE_PERMISSIONS[child.path];
            return allowed && allowed.includes(adminRole);
          });
          // Only include parent if at least one child is allowed
          if (allowedChildren.length > 0) {
            return { ...item, children: allowedChildren };
          }
          return null;
        }
        // Leaf item: check permission directly
        const allowed = ROUTE_PERMISSIONS[item.path];
        return allowed && allowed.includes(adminRole) ? item : null;
      })
      .filter((item): item is MenuItem => item !== null);
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
    const allUsers: { name?: string; email: string }[] = JSON.parse(localStorage.getItem("paleo_admin_all_users") || "[]");

    for (const u of allUsers) {
      const email = u.email;
      const membershipKey = `paleo_admin_society_membership_${email}`;
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

      const confsKey = `paleo_admin_confs_${email}`;
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
        const key = `paleo_admin_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_PENDING;
        membership.invoiceDeadline = addWorkdays(new Date().toISOString().split("T")[0], 7);
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_admin_confs_${targetEmail}`;
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
      const auditLog: AuditLogEntry[] = JSON.parse(localStorage.getItem("paleo_admin_audit_log") || "[]");
      auditLog.push(log);
      localStorage.setItem("paleo_admin_audit_log", JSON.stringify(auditLog));

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
        const key = `paleo_admin_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.VOUCHER_REJECTED;
        membership.voucherRejectReason = reason;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_admin_confs_${targetEmail}`;
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
        const key = `paleo_admin_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.ACTIVE;
        membership.expiryDate = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_admin_confs_${targetEmail}`;
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
        const key = `paleo_admin_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_REJECTED;
        membership.invoiceRejectReason = reason;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_admin_confs_${targetEmail}`;
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
        const key = `paleo_admin_society_membership_${targetEmail}`;
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const membership = JSON.parse(stored);
        membership.status = MEMBERSHIP_STATUS.INVOICE_PENDING;
        membership.invoiceExtendedDeadline = newDeadline;
        localStorage.setItem(key, JSON.stringify(membership));
      } else if (confId) {
        const key = `paleo_admin_confs_${targetEmail}`;
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
      JSON.parse(localStorage.getItem("paleo_admin_all_users") || "[]");

    const members: MemberRecord[] = allUsers.map(u => {
      const key = `paleo_admin_society_membership_${u.email}`;
      const stored = localStorage.getItem(key);
      const membership = stored ? JSON.parse(stored) : { status: "not_member", history: [] };
      const branchesKey = `paleo_admin_bound_branches_${u.email}`;
      const storedBranches = localStorage.getItem(branchesKey);
      const boundBranches: string[] = storedBranches ? JSON.parse(storedBranches) : [];
      const typeKey = `paleo_admin_user_type_${u.email}`;
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
    const key = `paleo_admin_society_membership_${email}`;
    const stored = localStorage.getItem(key);
    const membership = stored ? JSON.parse(stored) : { history: [] };
    const notifsKey = `paleo_admin_notifs_${email}`;
    const storedNotifs = localStorage.getItem(notifsKey);
    const userNotifs: AdminNotification[] = storedNotifs ? JSON.parse(storedNotifs) : [];
    return {
      ...member,
      paymentHistory: membership.history || [],
      notifications: userNotifs,
    };
  }, [getAllMembers]);

  const toggleMemberDisabled = useCallback((email: string) => {
    const key = `paleo_admin_society_membership_${email}`;
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
    const key = `paleo_admin_society_membership_${email}`;
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
    const stored = localStorage.getItem("paleo_admin_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const allUsers: { email: string }[] = JSON.parse(localStorage.getItem("paleo_admin_all_users") || "[]");
    return confs.map((c: ConferenceRecord) => {
      let count = 0;
      for (const u of allUsers) {
        const confsKey = `paleo_admin_confs_${u.email}`;
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
    const stored = localStorage.getItem("paleo_admin_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const newConf: ConferenceRecord = {
      ...data,
      id: `conf-${Date.now()}`,
      branchName: BRANCH_MAP[data.branchId] || data.branchId,
      registrations: 0,
    };
    confs.push(newConf);
    localStorage.setItem("paleo_admin_conferences_db", JSON.stringify(confs));
    // Sync fee config
    const feeMap = JSON.parse(localStorage.getItem("paleo_admin_conference_fee_config") || "{}");
    feeMap[newConf.id] = data.memberFee;
    localStorage.setItem("paleo_admin_conference_fee_config", JSON.stringify(feeMap));
    toast.success("会议创建成功");
    triggerRefresh();
  }, [triggerRefresh]);

  const updateConference = useCallback((id: string, data: ConferenceData) => {
    const stored = localStorage.getItem("paleo_admin_conferences_db");
    const confs: ConferenceRecord[] = stored ? JSON.parse(stored) : DEFAULT_CONFERENCES;
    const idx = confs.findIndex((c: ConferenceRecord) => c.id === id);
    if (idx >= 0) {
      confs[idx] = { ...confs[idx], ...data, branchName: BRANCH_MAP[data.branchId] || data.branchId };
      localStorage.setItem("paleo_admin_conferences_db", JSON.stringify(confs));
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
    const branchCounts = Object.entries(BRANCH_MAP).map(([id, name]) => ({
      name,
      count: members.filter(m => m.boundBranches.includes(id)).length,
    }));
    const nonMemberUsers = members.filter(m => m.userType === "non_member");
    const memberUsers = members.filter(m => m.userType === "member");
    return {
      totalUsers: members.length,
      nonMemberCount: nonMemberUsers.length,
      memberCount: memberUsers.length,
      activeMembers: memberUsers.filter(m => m.membershipStatus === MEMBERSHIP_STATUS.ACTIVE).length,
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
      branchUserCount: members.length,
      recentRegistrations: [],
    };
  }, [getAllConferences, getAllMembers, buildReviewQueues]);

  const getFinanceDashboardStats = useCallback((): FinanceDashboardStats => {
    const { vouchers, invoices } = buildReviewQueues();
    const auditLog: AuditLogEntry[] = JSON.parse(localStorage.getItem("paleo_admin_audit_log") || "[]");
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
    const allUsers: { name?: string; email: string }[] = JSON.parse(localStorage.getItem("paleo_admin_all_users") || "[]");
    const records: ReviewItem[] = [];
    for (const u of allUsers) {
      const key = `paleo_admin_society_membership_${u.email}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const membership = JSON.parse(stored);
        if (membership.status && membership.status !== "not_member") {
          records.push(buildReviewItem(u.email, u, "society_fee"));
        }
      }
      const confsKey = `paleo_admin_confs_${u.email}`;
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
    const stored = localStorage.getItem("paleo_admin_branches_db");
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
      localStorage.setItem("paleo_admin_branches_db", JSON.stringify(branches));
      toast.success("分会信息已更新");
      triggerRefresh();
    }
  }, [getAllBranches, triggerRefresh]);

  const toggleBranchDisabled = useCallback((id: string) => {
    const branches = getAllBranches();
    const idx = branches.findIndex(b => b.id === id);
    if (idx >= 0) {
      branches[idx].disabled = !branches[idx].disabled;
      localStorage.setItem("paleo_admin_branches_db", JSON.stringify(branches));
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
