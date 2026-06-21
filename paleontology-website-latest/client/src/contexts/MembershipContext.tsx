import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  type ConferenceStatus,
  type MembershipStatus,
  CONFERENCE_STATUS,
  MEMBERSHIP_STATUS,
  USER_TYPE,
  type UserType,
  type ConferenceFeeType,
  type ConferenceFeeConfig,
  type AccommodationType,
  type FieldTripSelections,
  createEmptyFieldTripSelections,
  getMembershipFee as getConfiguredMembershipFee,
  getConferenceFeeConfig as getConfiguredFeeConfig,
  getConferenceFeeByType,
  deriveFeeType,
  isSocietyAccessible,
  ALL_SOCIETY_UNITS,
  CONFIRMED_PAYMENT_STATUSES,
  isDeadlinePassed,
} from "@shared/constants";

/** 智能审核：工作日加算（与管理端一致） */
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

// ============================================================================
// TYPES
// ============================================================================

export type MemberType = "普通会员" | "外籍会员" | "单位会员" | "荣誉会员";

export interface User {
  email: string;
  name: string;
  gender: "男" | "女";
  unit: string;
  role: "学生" | "教师" | "嘉宾";
  title?: string;
  // Phase 0: 用户身份扩展（学生/非学生维度）
  isStudent?: boolean;
  // 会员类型预留字段（当前默认普通会员，后续迭代细化）
  memberType?: MemberType;
}

export interface PaymentRecord {
  id: string;
  type: "society_fee" | "conference_fee";
  targetName: string; // "中国古生物学会会员费" or Conference title
  amount: number;
  voucherUrl: string;
  invoiceUrl: string;
  submitTime: string;
  auditTime?: string;
  status: "pending" | "approved" | "rejected" | "voucher_submitted" | "voucher_rejected" | "invoice_submitted" | "invoice_rejected";
  rejectReason?: string;
  /** 区分是凭证驳回还是发票驳回（两阶段审核） */
  rejectPhase?: "voucher" | "invoice";
}

// 统一学会会员状态（两阶段审核）
export interface SocietyMembership {
  status: MembershipStatus | "pending" | "rejected"; // "pending"/"rejected" 为旧状态兼容，Phase 2 移除
  expiryDate?: string;
  /** @deprecated 使用 voucherRejectReason 或 invoiceRejectReason */
  rejectReason?: string;
  voucherRejectReason?: string;
  invoiceRejectReason?: string;
  applicationRejectReason?: string;
  invoiceDeadline?: string;
  invoiceExtendedDeadline?: string;
  voucherAuditTime?: string;
  invoiceAuditTime?: string;
  smartReviewNote?: string;
  frozenDueToExpiry?: boolean;
  /** @deprecated 从 PaymentRecord 中读取金额，Phase 2 移除 */
  amount?: number;
  history: PaymentRecord[];
}

export interface ConferenceReg {
  status: ConferenceStatus | "pending" | "approved_unfilled" | "submitted" | "approved_invoice" | "active" | "rejected"; // 旧状态兼容，Phase 2 移除
  // Phase 1: Voucher (凭证)
  paymentVoucher?: string;
  voucherSubmitTime?: string;
  voucherAuditTime?: string;
  voucherRejectReason?: string;
  // Phase 2: Invoice (发票)
  invoiceUrl?: string;
  invoiceSubmitTime?: string;
  invoiceAuditTime?: string;
  invoiceRejectReason?: string;
  invoiceDeadline?: string;         // 发票上传截止日（凭证初审通过 + 7工作日）
  invoiceExtendedDeadline?: string; // 手动延长期限
  // Membership expiry
  frozenDueToExpiry?: boolean;
  // Form fields (editable when status = invoice_pending)
  name: string;
  gender: "男" | "女";
  unit: string;
  role: "学生" | "教师" | "嘉宾";
  /** @deprecated Phase 4 起请使用 accommodationType */
  accommodation: "单间" | "双人间" | "自行安排";
  session: string;
  presentationType: "口头报告" | "展板报告" | "仅参会";
  reportTitle?: string;
  abstractFileName?: string;
  lastUpdated?: string;
  // Phase 4: 摘要文件
  abstractFileUrl?: string;
  abstractSubmitTime?: string;
  // Phase 4: 住宿（性别化选项）
  accommodationType?: AccommodationType;
  // Phase 4: 野外报名
  fieldTripSelections?: FieldTripSelections;
  // 报名时锁定的费用类型与金额（不受后续身份变更影响）
  feeType?: ConferenceFeeType;
  lockedAmount?: number;
  /** @deprecated 旧字段兼容，Phase 2 移除 */
  conferenceForm?: any;
  /** @deprecated 旧字段兼容，Phase 2 移除 */
  reportType?: string;
  smartReviewNote?: string;
}

/** 智能审核 mock：凭证/发票自动通过（原型演示，减少人工审核队列） */
function smartApproveVoucherMembership(membership: SocietyMembership): SocietyMembership {
  return {
    ...membership,
    status: "invoice_pending",
    invoiceDeadline: addWorkdays(new Date().toISOString().split("T")[0], 7),
    voucherAuditTime: new Date().toISOString(),
    smartReviewNote: "智能审核：凭证金额与用户信息匹配，已自动通过初审",
  };
}

function smartApproveInvoiceMembership(membership: SocietyMembership): SocietyMembership {
  const expiryDate = new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];
  return {
    ...membership,
    status: "active",
    expiryDate,
    invoiceAuditTime: new Date().toISOString(),
    smartReviewNote: "智能审核：发票信息与凭证一致，已自动通过终审",
  };
}

function smartApproveVoucherConference(reg: ConferenceReg): ConferenceReg {
  return {
    ...reg,
    status: "invoice_pending",
    invoiceDeadline: addWorkdays(new Date().toISOString().split("T")[0], 7),
    voucherAuditTime: new Date().toISOString(),
    smartReviewNote: "智能审核：凭证金额与锁定费用一致，已自动通过初审",
  };
}

function smartApproveInvoiceConference(reg: ConferenceReg): ConferenceReg {
  return {
    ...reg,
    status: "confirmed",
    invoiceAuditTime: new Date().toISOString(),
    smartReviewNote: "智能审核：发票信息与凭证一致，已自动通过终审",
  };
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

// Phase 6: 入会/退会申请书数据
export interface MembershipApplication {
  status: string;          // application_submitted | application_rejected | application_approved
  applicationFileUrl: string;
  applicationFileName: string;
  submitTime: string;
  reviewTime?: string;
  rejectReason?: string;
}

export interface WithdrawalApplication {
  status: string;          // withdrawal_submitted | withdrawal_rejected | withdrawn
  applicationFileUrl: string;
  applicationFileName: string;
  submitTime: string;
  reviewTime?: string;
  rejectReason?: string;
}

interface MembershipContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  societyMembership: SocietyMembership;
  boundBranches: string[]; // 已绑定的分会 ID 列表
  conferenceRegs: { [confId: string]: ConferenceReg };
  notifications: SystemNotification[];
  allUsers: User[];

  // ── 双路径选择（新增） ──
  userType: UserType;
  membershipChoiceMade: boolean;
  chooseMembershipPath: (path: "member" | "non_member") => void;

  // Auth actions
  register: (user: User, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (user: Partial<User>) => void;
  resetPassword: (email: string) => void;

  // ── 统一学会会员费（两阶段） ──
  /** @deprecated Phase 2 将拆分为 submitMembershipVoucher + submitMembershipInvoice */
  applySocietyMembership: (voucherUrl: string, invoiceUrl: string, amount: number) => void;
  /** 阶段一：提交缴费凭证 */
  submitMembershipVoucher: (voucherUrl: string, amount: number) => void;
  /** 阶段二：提交电子发票 */
  submitMembershipInvoice: (invoiceUrl: string) => void;

  // 分会绑定/解绑（无需审核，仅需有效会员资格）
  toggleBranchBinding: (branchId: string) => void;

  // ── Conference actions（两阶段） ──
  /** @deprecated Phase 2 将拆分为 submitConferenceVoucher + submitConferenceInvoice */
  payConference: (confId: string, voucherUrl: string, invoiceUrl: string, amount: number) => void;
  /** 阶段一：提交会议费凭证 */
  submitConferenceVoucher: (confId: string, voucherUrl: string, amount: number) => void;
  /** 阶段二：提交会议费发票 */
  submitConferenceInvoice: (confId: string, invoiceUrl: string) => void;
  submitConferenceForm: (confId: string, formData: Omit<ConferenceReg, "status" | "paymentVoucher" | "invoiceUrl">) => void;
  deleteAbstract: (confId: string) => void;
  uploadAbstract: (confId: string, fileName: string) => void;
  // Phase 4: 摘要/住宿/野外
  uploadAbstractFile: (confId: string, fileUrl: string, fileName: string) => void;
  setAccommodation: (confId: string, type: AccommodationType) => void;
  toggleFieldTripRoute: (confId: string, phase: "pre" | "during" | "post", routeId: string) => void;

  // ── 内部模拟审核（两阶段，演示用） ──
  /** @deprecated Phase 2 拆分为初审/终审 */
  simApproveSocietyMembership: () => void;
  /** @deprecated Phase 2 拆分为初审/终审 */
  simRejectSocietyMembership: (reason: string) => void;
  /** @deprecated Phase 2 拆分为初审/终审 */
  simApproveConference: (confId: string) => void;
  /** @deprecated Phase 2 拆分为初审/终审 */
  simRejectConference: (confId: string, reason: string) => void;

  // 会员费两阶段审核
  simApproveSocietyVoucher: () => void;
  simRejectSocietyVoucher: (reason: string) => void;
  simApproveSocietyInvoice: () => void;
  simRejectSocietyInvoice: (reason: string) => void;

  // 会议费两阶段审核
  simApproveConferenceVoucher: (confId: string) => void;
  simRejectConferenceVoucher: (confId: string, reason: string) => void;
  simApproveConferenceInvoice: (confId: string) => void;
  simRejectConferenceInvoice: (confId: string, reason: string) => void;

  // ── 宽限期与过期处理 ──
  /** 检查并更新逾期状态 */
  checkInvoiceOverdue: () => void;
  /** 手动延长发票上传期限 */
  extendInvoiceDeadline: (confId: string, newDeadline: string, reason?: string) => void;
  /** 会员到期时的分级处理 */
  handleMembershipExpiry: () => void;
  /** 续费后的恢复逻辑 */
  handleMembershipRenewal: () => void;

  // ── 配置读取 ──
  getMembershipFee: (memberType?: string) => number;
  /** @deprecated Phase 0 起请使用 getUserFeeType + getConferenceFeeConfig */
  getConferenceFee: (confId: string) => number;
  // Phase 0: New fee API
  getUserFeeType: () => ConferenceFeeType;
  getConferenceFeeConfig: (confId: string) => ConferenceFeeConfig;
  // Phase 2: File download helpers
  canDownloadStampedNotice: (confId: string) => boolean;
  canDownloadAbstractTemplate: (confId: string) => boolean;
  canAccessConferenceForm: (confId: string) => boolean;
  getConferenceFileUrl: (confId: string, fileType: "stampedNotice" | "abstractTemplate" | "publicNotice") => string | null;

  // Phase 6: 入会/退会申请
  membershipApplication: MembershipApplication | null;
  withdrawalApplication: WithdrawalApplication | null;
  submitMembershipApplication: (applicationFileUrl: string, applicationFileName: string) => void;
  cancelMembershipApplication: () => void;
  submitWithdrawalApplication: (applicationFileUrl: string, applicationFileName: string) => void;
  cancelWithdrawalApplication: () => void;
  getMembershipApplicationTemplateUrl: () => string;
  getWithdrawalApplicationTemplateUrl: () => string;

  // 入会/退会申请模拟审核（演示用，等同 Admin AuditWorkbench approve/reject）
  simApproveMembershipApplication: () => void;
  simRejectMembershipApplication: (reason: string) => void;
  simApproveWithdrawalApplication: () => void;
  simRejectWithdrawalApplication: (reason: string) => void;

  // General Helpers
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================

const DEFAULT_SOCIETY_MEMBERSHIP: SocietyMembership = {
  status: "not_member",
  history: []
};

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-welcome",
    title: "欢迎加入中国古生物学会数字化平台",
        content: "您已成功注册账号。请前往【学会服务 → 会员服务】缴纳学会会员费，成为正式会员后即可绑定各专业分会、参加学术会议。",
    time: "2026-06-01 09:00",
    read: false,
    type: "info"
  }
];

const MOCK_USER_DB = [
  {
    email: "demo@paleontology.org.cn",
    password: "demo123",
    name: "演示用户",
    gender: "男" as const,
    unit: "中国古生物学会",
    role: "教师" as const,
    title: "高级工程师",
    memberType: "普通会员" as MemberType
  },
  {
    email: "member@paleontology.org.cn",
    password: "password123",
    name: "张华",
    gender: "男" as const,
    unit: "中国科学院古脊椎动物与古人类研究所",
    role: "教师" as const,
    title: "研究员",
    memberType: "普通会员" as MemberType
  },
  {
    email: "student@paleontology.org.cn",
    password: "password123",
    name: "李萌",
    gender: "女" as const,
    unit: "南京大学地科院",
    role: "学生" as const,
    title: "硕士研究生",
    memberType: "普通会员" as MemberType
  }
];

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const MembershipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [societyMembership, setSocietyMembership] = useState<SocietyMembership>(DEFAULT_SOCIETY_MEMBERSHIP);
  const [boundBranches, setBoundBranches] = useState<string[]>([]);
  const [conferenceRegs, setConferenceRegs] = useState<{ [confId: string]: ConferenceReg }>({});
  const [notifications, setNotifications] = useState<SystemNotification[]>(DEFAULT_NOTIFICATIONS);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USER_DB.map(({ password, ...u }) => u));
  const [userType, setUserType] = useState<UserType>("regular");
  const [membershipChoiceMade, setMembershipChoiceMade] = useState(false);
  // Phase 6: 入会/退会申请书状态
  const [membershipApplication, setMembershipApplication] = useState<MembershipApplication | null>(null);
  const [withdrawalApplication, setWithdrawalApplication] = useState<WithdrawalApplication | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("paleo_current_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      // Load user-specific states
      loadUserState(user.email);
    }

    const storedAllUsers = localStorage.getItem("paleo_all_users");
    if (storedAllUsers) {
      setAllUsers(JSON.parse(storedAllUsers));
    } else {
      localStorage.setItem("paleo_all_users", JSON.stringify(MOCK_USER_DB.map(({ password, ...u }) => u)));
    }
  }, []);

  // Phase 2: 轮询 localStorage，同步管理端 AuditWorkbench 审核结果到 React 状态
  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;

    const syncAuditFromStorage = () => {
      const storedMem = localStorage.getItem(`paleo_society_membership_${email}`);
      if (storedMem) {
        const parsed = JSON.parse(storedMem) as SocietyMembership;
        setSocietyMembership((prev) =>
          prev.status === parsed.status &&
          prev.expiryDate === parsed.expiryDate &&
          prev.applicationRejectReason === parsed.applicationRejectReason
            ? prev
            : parsed
        );
      }

      const storedApp = localStorage.getItem(`paleo_membership_application_${email}`);
      const nextApp = storedApp ? JSON.parse(storedApp) as MembershipApplication : null;
      setMembershipApplication((prev) =>
        JSON.stringify(prev) === JSON.stringify(nextApp) ? prev : nextApp
      );

      const storedWd = localStorage.getItem(`paleo_withdrawal_application_${email}`);
      const nextWd = storedWd ? JSON.parse(storedWd) as WithdrawalApplication : null;
      setWithdrawalApplication((prev) =>
        JSON.stringify(prev) === JSON.stringify(nextWd) ? prev : nextWd
      );

      const storedType = localStorage.getItem(`paleo_user_type_${email}`);
      if (storedType) {
        setUserType((prev) => (prev === storedType ? prev : storedType as UserType));
      }
    };

    syncAuditFromStorage();
    const timer = window.setInterval(syncAuditFromStorage, 2500);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes(email)) syncAuditFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [currentUser?.email]);

  // 会员到期自动退会：超期未续费 → expired + 非会员身份
  useEffect(() => {
    if (!currentUser || userType !== "member") return;
    if (societyMembership.status !== "active" || !societyMembership.expiryDate) return;
    const expiryEnd = new Date(societyMembership.expiryDate);
    expiryEnd.setHours(23, 59, 59, 999);
    if (new Date() > expiryEnd) {
      handleMembershipExpiry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleMembershipExpiry reads latest state when invoked
  }, [currentUser?.email, userType, societyMembership.status, societyMembership.expiryDate]);

  const loadUserState = (email: string) => {
    const membershipKey = `paleo_society_membership_${email}`;
    const branchesKey = `paleo_bound_branches_${email}`;
    const confsKey = `paleo_confs_${email}`;
    const notifsKey = `paleo_notifs_${email}`;

    const storedMembership = localStorage.getItem(membershipKey);
    setSocietyMembership(storedMembership ? JSON.parse(storedMembership) : DEFAULT_SOCIETY_MEMBERSHIP);

    const storedBranches = localStorage.getItem(branchesKey);
    const parsedBranches: string[] = storedBranches ? JSON.parse(storedBranches) : [];
    // 有效的新格式分会 id（过滤掉旧的数字 id "1"~"6" 等历史残留数据）
    const VALID_BRANCH_IDS = new Set(["gwjzdwxfh","kpgzwyh","bfxfh","wtxfh","hszlzwyh","gzwxfh","dqswx","gst","gjzdw","swcj","xjsxff"]);
    const cleanBranches = Array.from(new Set(parsedBranches.filter((id: string) => VALID_BRANCH_IDS.has(id))));
    setBoundBranches(cleanBranches);
    // 如果数据被清理了，同步写回 localStorage
    if (cleanBranches.length !== parsedBranches.length) {
      localStorage.setItem(branchesKey, JSON.stringify(cleanBranches));
    }

    const storedConfs = localStorage.getItem(confsKey);
    setConferenceRegs(storedConfs ? JSON.parse(storedConfs) : {});

    const storedNotifs = localStorage.getItem(notifsKey);
    setNotifications(storedNotifs ? JSON.parse(storedNotifs) : DEFAULT_NOTIFICATIONS);

    const typeKey = `paleo_user_type_${email}`;
    const storedType = localStorage.getItem(typeKey);
    setUserType((storedType as UserType) || "regular");

    const choiceKey = `paleo_choice_made_${email}`;
    setMembershipChoiceMade(localStorage.getItem(choiceKey) === "true");

    // Phase 6: 加载入会/退会申请书
    const appKey = `paleo_membership_application_${email}`;
    const storedApp = localStorage.getItem(appKey);
    setMembershipApplication(storedApp ? JSON.parse(storedApp) : null);

    const wdKey = `paleo_withdrawal_application_${email}`;
    const storedWd = localStorage.getItem(wdKey);
    setWithdrawalApplication(storedWd ? JSON.parse(storedWd) : null);
  };

  /** 用户端写入时同步管理端 localStorage（Phase 1/2 双写策略） */
  const ADMIN_MIRROR_PREFIXES = ["paleo_confs_", "paleo_society_membership_", "paleo_bound_branches_"];

  const saveState = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
    if (ADMIN_MIRROR_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      localStorage.setItem(key.replace(/^paleo_/, "paleo_admin_"), JSON.stringify(data));
    }
  };

  const syncAdminUserRegistry = (user: User) => {
    const profile = {
      name: user.name,
      email: user.email,
      gender: user.gender,
      unit: user.unit,
      role: user.role,
      isStudent: user.isStudent ?? user.role === "学生",
      memberType: user.memberType,
    };
    const adminUsers: typeof profile[] = JSON.parse(localStorage.getItem("paleo_admin_all_users") || "[]");
    const idx = adminUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) adminUsers[idx] = { ...adminUsers[idx], ...profile };
    else adminUsers.push(profile);
    localStorage.setItem("paleo_admin_all_users", JSON.stringify(adminUsers));
  };

  const syncAdminApplication = (
    email: string,
    kind: "membership" | "withdrawal",
    app: MembershipApplication | WithdrawalApplication | null
  ) => {
    const userKey =
      kind === "membership"
        ? `paleo_membership_application_${email}`
        : `paleo_withdrawal_application_${email}`;
    const adminKey =
      kind === "membership"
        ? `paleo_admin_membership_application_${email}`
        : `paleo_admin_withdrawal_application_${email}`;
    if (app) {
      const payload = JSON.stringify(app);
      localStorage.setItem(userKey, payload);
      localStorage.setItem(adminKey, payload);
    } else {
      localStorage.removeItem(userKey);
      localStorage.removeItem(adminKey);
    }
  };

  const addNotification = (notif: Omit<SystemNotification, "id" | "time" | "read">, email?: string) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      time: new Date().toLocaleString("zh-CN"),
      read: false,
      ...notif
    };
    const targetEmail = email || currentUser?.email;
    if (targetEmail) {
      const key = `paleo_notifs_${targetEmail}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [newNotif, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));
      if (!email || email === currentUser?.email) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
    return newNotif;
  };

  // ==========================================
  // AUTH ACTIONS
  // ==========================================

  const register = (user: User, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("paleo_user_db") || JSON.stringify(MOCK_USER_DB));

    if (users.some((u: any) => u.email.toLowerCase() === user.email.toLowerCase())) {
      toast.error("该邮箱已被注册，请直接登录。");
      return false;
    }

    const newUser = { ...user, memberType: "普通会员" as MemberType };
    const updatedUsers = [...users, { ...newUser, password }];
    localStorage.setItem("paleo_user_db", JSON.stringify(updatedUsers));

    const updatedAllUsers = [...allUsers, newUser];
    setAllUsers(updatedAllUsers);
    saveState("paleo_all_users", updatedAllUsers);

    // 初始化新用户的数据
    const email = user.email;
    localStorage.setItem(`paleo_society_membership_${email}`, JSON.stringify(DEFAULT_SOCIETY_MEMBERSHIP));
    localStorage.setItem(`paleo_bound_branches_${email}`, JSON.stringify([]));
    localStorage.setItem(`paleo_confs_${email}`, JSON.stringify({}));
    localStorage.setItem(`paleo_notifs_${email}`, JSON.stringify(DEFAULT_NOTIFICATIONS));
    // 同步管理端 registry（AuditWorkbench 可读）
    localStorage.setItem(`paleo_admin_society_membership_${email}`, JSON.stringify(DEFAULT_SOCIETY_MEMBERSHIP));
    localStorage.setItem(`paleo_admin_bound_branches_${email}`, JSON.stringify([]));
    localStorage.setItem(`paleo_admin_confs_${email}`, JSON.stringify({}));
    syncAdminUserRegistry(newUser);

    toast.success("账号注册成功！请登录后前往【学会服务 → 会员服务】缴纳会员费，成为正式会员。");
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("paleo_user_db") || JSON.stringify(MOCK_USER_DB));
    const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!matched) {
      toast.error("邮箱或密码错误，请重试。");
      return false;
    }

    const { password: _, ...userProfile } = matched;
    setCurrentUser(userProfile);
    saveState("paleo_current_user", userProfile);
    loadUserState(email);

    toast.success(`欢迎回来，${matched.name}！`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      const email = currentUser.email;
      saveState(`paleo_society_membership_${email}`, societyMembership);
      saveState(`paleo_bound_branches_${email}`, boundBranches);
      saveState(`paleo_confs_${email}`, conferenceRegs);
      saveState(`paleo_notifs_${email}`, notifications);
    }

    setCurrentUser(null);
    localStorage.removeItem("paleo_current_user");
    setSocietyMembership(DEFAULT_SOCIETY_MEMBERSHIP);
    setBoundBranches([]);
    setConferenceRegs({});
    setNotifications([]);
    setUserType("regular");
    setMembershipChoiceMade(false);
    toast.info("您已安全退出登录。");
  };

  const deleteAccount = () => {
    if (!currentUser) return;

    const email = currentUser.email;

    // 1. 从用户数据库中删除
    const users = JSON.parse(localStorage.getItem("paleo_user_db") || JSON.stringify(MOCK_USER_DB));
    const filteredUsers = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem("paleo_user_db", JSON.stringify(filteredUsers));

    // 2. 清除该用户的所有个人数据
    localStorage.removeItem(`paleo_society_membership_${email}`);
    localStorage.removeItem(`paleo_bound_branches_${email}`);
    localStorage.removeItem(`paleo_confs_${email}`);
    localStorage.removeItem(`paleo_notifs_${email}`);
    localStorage.removeItem(`paleo_user_type_${email}`);
    localStorage.removeItem(`paleo_choice_made_${email}`);

    // 3. 从全体用户列表中删除
    const updatedAllUsers = allUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setAllUsers(updatedAllUsers);
    saveState("paleo_all_users", updatedAllUsers);

    // 4. 清除登录状态
    localStorage.removeItem("paleo_current_user");
    setCurrentUser(null);
    setSocietyMembership(DEFAULT_SOCIETY_MEMBERSHIP);
    setBoundBranches([]);
    setConferenceRegs({});
    setNotifications([]);
    setUserType("regular");
    setMembershipChoiceMade(false);

    toast.info("您的账号已成功注销。感谢您使用中国古生物学会数字化平台。");
  };

  const updateProfile = (profileUpdates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileUpdates };
    setCurrentUser(updated);
    saveState("paleo_current_user", updated);

    const users = JSON.parse(localStorage.getItem("paleo_user_db") || JSON.stringify(MOCK_USER_DB));
    const updatedUsers = users.map((u: any) => u.email === currentUser.email ? { ...u, ...profileUpdates } : u);
    localStorage.setItem("paleo_user_db", JSON.stringify(updatedUsers));

    const updatedAllUsers = allUsers.map(u => u.email === currentUser.email ? { ...u, ...profileUpdates } : u);
    setAllUsers(updatedAllUsers);
    saveState("paleo_all_users", updatedAllUsers);
    syncAdminUserRegistry(updated);

    addNotification({ title: "个人资料更新成功", content: "您的实名信息和学术背景资料已成功更新。", type: "info" });
    toast.success("个人信息修改成功！");
  };

  const resetPassword = (email: string) => {
    const users = JSON.parse(localStorage.getItem("paleo_user_db") || JSON.stringify(MOCK_USER_DB));
    const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      toast.error("未找到该邮箱注册的账号。");
      return;
    }
    toast.success(`密码重置邮件已发送至 ${email}，请查收并按照链接修改密码。`);
  };

  // ==========================================
  // 统一学会会员费（两阶段审核）
  // ==========================================

  /** @deprecated Phase 2: 请使用 submitMembershipVoucher */
  const applySocietyMembership = (voucherUrl: string, invoiceUrl: string, amount: number) => {
    submitMembershipVoucher(voucherUrl, amount);
  };

  /** 阶段一：提交缴费凭证 → status = voucher_submitted */
  const submitMembershipVoucher = (voucherUrl: string, amount: number) => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    const payableStatuses: MembershipStatus[] = [
      "application_approved",
      "expired",
      "voucher_rejected",
      "invoice_rejected",
      "invoice_pending",
      "invoice_overdue",
    ];
    if (userType === "member" && !payableStatuses.includes(societyMembership.status as MembershipStatus)) {
      toast.error("请先提交入会申请书并通过管理员审核后，再缴纳会费。");
      return;
    }

    const newRecord: PaymentRecord = {
      id: `rec-s-${Date.now()}`,
      type: "society_fee",
      targetName: "中国古生物学会会员费",
      amount,
      voucherUrl,
      invoiceUrl: "",
      submitTime: new Date().toLocaleString("zh-CN"),
      status: "voucher_submitted"
    };

    const updatedMembership: SocietyMembership = smartApproveVoucherMembership({
      ...societyMembership,
      status: "voucher_submitted",
      history: [newRecord, ...societyMembership.history]
    });

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "学会会员费凭证已通过智能初审",
      content: `您提交的会员费凭证（¥${amount}）已通过智能审核。请在 ${updatedMembership.invoiceDeadline} 前上传电子发票。`,
      type: "success"
    });

    toast.success("会员费凭证已提交，智能审核已通过初审，请上传电子发票。");
  };

  /** 阶段二：提交电子发票 → status = invoice_submitted */
  const submitMembershipInvoice = (invoiceUrl: string) => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    if (societyMembership.status !== "invoice_pending" && societyMembership.status !== "invoice_overdue") {
      toast.error("请先等待凭证初审通过后再上传发票。");
      return;
    }

    const updatedHistory = societyMembership.history.map(h =>
      (h.status === "voucher_submitted" || h.status === "invoice_submitted") && h.type === "society_fee"
        ? { ...h, invoiceUrl, status: "invoice_submitted" as const, submitTime: h.submitTime }
        : h
    );

    const afterInvoiceSubmit: SocietyMembership = {
      ...societyMembership,
      status: "invoice_submitted",
      history: updatedHistory
    };
    const updatedMembership = smartApproveInvoiceMembership(afterInvoiceSubmit);

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "会员资格已生效",
      content: `您的会员费已通过智能终审，会员资格已生效，有效期至 ${updatedMembership.expiryDate}。`,
      type: "success"
    });

    toast.success("电子发票已通过智能终审，会员资格已生效。");
  };

  // ==========================================
  // 分会绑定/解绑
  // ==========================================

  const toggleBranchBinding = (branchId: string) => {
    if (!currentUser) {
      toast.error("请先登录系统。");
      return;
    }

    // Phase 2: 所有注册用户均可绑定任意学会/分会（无门槛）

    const isBound = boundBranches.includes(branchId);
    let updatedBranches: string[];

    if (isBound) {
      updatedBranches = boundBranches.filter(id => id !== branchId);
      const branchName = getBranchName(branchId);
      addNotification({
        title: "已解绑分会",
        content: `您已成功解绑【${branchName}】，将不再接收该分会的会议通知和学术资讯。`,
        type: "info"
      });
      toast.success(`已解绑【${branchName}】。`);
    } else {
      updatedBranches = Array.from(new Set([...boundBranches, branchId]));
      const branchName = getBranchName(branchId);
      addNotification({
        title: "成功绑定分会",
        content: `您已成功绑定【${branchName}】！今后将自动接收该分会发布的会议通知和学术资讯。`,
        type: "success"
      });
      toast.success(`已成功绑定【${branchName}】！`);
    }

    setBoundBranches(updatedBranches);
    saveState(`paleo_bound_branches_${currentUser.email}`, updatedBranches);
  };

  // ==========================================
  // CONFERENCE ACTIONS（两阶段审核）
  // ==========================================

  /** @deprecated Phase 2: 请使用 submitConferenceVoucher */
  const payConference = (confId: string, voucherUrl: string, invoiceUrl: string, amount: number) => {
    submitConferenceVoucher(confId, voucherUrl, amount);
  };

  /** 阶段一：提交会议费凭证 → status = voucher_submitted */
  const submitConferenceVoucher = (confId: string, voucherUrl: string, amount: number) => {
    if (!currentUser) return;

    if (userType === "regular") {
      toast.error("请先选择您的参与方式（会员/非会员）后再报名会议。");
      return;
    }
    if (userType === "member" && societyMembership.status !== "active" && societyMembership.status !== "invoice_pending" && societyMembership.status !== "invoice_submitted") {
      toast.error("您尚未完成会员缴费验证，请先前往会员服务完成入会流程后再报名会议。");
      return;
    }

    const confTitle = getConferenceTitle(confId);
    const confBranchId = getConferenceBranchId(confId);
    if (confBranchId && !isSocietyAccessible(boundBranches, confBranchId)) {
      toast.error(`您需要先绑定该会议所属的分会（${getBranchName(confBranchId)}），才能缴纳会议注册费。`);
      return;
    }

    const feeType = deriveFeeType(userType, currentUser.isStudent ?? (currentUser.role === "学生"));
    const lockedAmount = getConferenceFeeByType(confId, feeType);
    if (lockedAmount <= 0) {
      toast.error("当前身份暂不支持报名该会议，请联系学会管理员。");
      return;
    }

    const afterVoucher: ConferenceReg = {
      ...(conferenceRegs[confId] || {
        name: currentUser.name,
        gender: currentUser.gender,
        unit: currentUser.unit,
        role: currentUser.role,
        accommodation: "自行安排",
        session: "待选择",
        presentationType: "仅参会"
      }),
      status: "voucher_submitted",
      paymentVoucher: voucherUrl,
      feeType,
      lockedAmount,
      voucherSubmitTime: new Date().toLocaleString("zh-CN"),
      lastUpdated: new Date().toLocaleString("zh-CN")
    };
    const updatedReg = smartApproveVoucherConference(afterVoucher);

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议注册费凭证已通过智能初审",
      content: `【${confTitle}】凭证已通过智能审核（¥${lockedAmount}）。请在 ${updatedReg.invoiceDeadline} 前上传电子发票并填写参会信息。`,
      type: "success"
    });

    toast.success(`【${confTitle}】凭证已通过智能初审，请上传电子发票。`);
  };

  /** 阶段二：提交会议费发票 + OCR 模拟比对 → status = invoice_submitted */
  const submitConferenceInvoice = (confId: string, invoiceUrl: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) {
      toast.error("请先提交会议注册费凭证。");
      return;
    }

    if (currentReg.status !== "invoice_pending" && currentReg.status !== "invoice_overdue") {
      toast.error("请先等待凭证初审通过后再上传发票。");
      return;
    }

    const afterInvoice: ConferenceReg = {
      ...currentReg,
      status: "invoice_submitted",
      invoiceUrl,
      invoiceSubmitTime: new Date().toLocaleString("zh-CN"),
      lastUpdated: new Date().toLocaleString("zh-CN")
    };
    const updatedReg = smartApproveInvoiceConference(afterInvoice);

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    addNotification({
      title: "会议报名已确认",
      content: `【${confTitle}】发票已通过智能终审，报名已确认。您现在可以填写摘要、住宿和野外考察信息。`,
      type: "success"
    });

    toast.success("电子发票已通过智能终审，报名已确认。");
  };

  const submitConferenceForm = (confId: string, formData: Omit<ConferenceReg, "status" | "paymentVoucher" | "invoiceUrl">) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg || currentReg.status !== CONFERENCE_STATUS.CONFIRMED) {
      toast.error("请先完成会议费两阶段审核（凭证→发票→终审确认）后再填写参会信息。");
      return;
    }

    const updatedReg: ConferenceReg = {
      ...currentReg,
      ...formData,
      status: CONFERENCE_STATUS.CONFIRMED,
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    addNotification({
      title: "参会信息已更新",
      content: `您已成功提交/更新了在【${confTitle}】中的参会信息。请记得在截止日前上传电子发票完成终审。`,
      type: "success"
    });

    toast.success("参会及报告信息保存成功！");
  };

  const deleteAbstract = (confId: string) => {
    if (!currentUser) return;
    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const updatedReg: ConferenceReg = { ...currentReg, abstractFileName: undefined, lastUpdated: new Date().toLocaleString("zh-CN") };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
    toast.info("学术论文摘要文件已成功删除，请尽快上传新版摘要。");
  };

  const uploadAbstract = (confId: string, fileName: string) => {
    if (!currentUser) return;
    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const updatedReg: ConferenceReg = { ...currentReg, abstractFileName: fileName, lastUpdated: new Date().toLocaleString("zh-CN") };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
    toast.success(`新摘要【${fileName}】上传成功！`);
  };

  // Phase 4: 上传摘要文件（含 URL）
  const uploadAbstractFile = (confId: string, fileUrl: string, fileName: string) => {
    if (!currentUser) return;
    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const now = new Date().toLocaleString("zh-CN");
    const updatedReg: ConferenceReg = {
      ...currentReg,
      abstractFileName: fileName,
      abstractFileUrl: fileUrl,
      abstractSubmitTime: now,
      lastUpdated: now,
    };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
    toast.success(`论文摘要【${fileName}】上传成功！`);
  };

  // Phase 4: 设置住宿类型（性别化选项）
  const setAccommodation = (confId: string, type: AccommodationType) => {
    if (!currentUser) return;
    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const updatedReg: ConferenceReg = {
      ...currentReg,
      accommodationType: type,
      lastUpdated: new Date().toLocaleString("zh-CN"),
    };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
  };

  // Phase 4: 切换野外路线选择
  const toggleFieldTripRoute = (confId: string, phase: "pre" | "during" | "post", routeId: string) => {
    if (!currentUser) return;
    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const currentSelections = currentReg.fieldTripSelections || createEmptyFieldTripSelections();
    const phaseRoutes = [...currentSelections[phase]];
    const idx = phaseRoutes.indexOf(routeId);
    if (idx >= 0) {
      phaseRoutes.splice(idx, 1);
    } else {
      phaseRoutes.push(routeId);
    }

    const updatedReg: ConferenceReg = {
      ...currentReg,
      fieldTripSelections: { ...currentSelections, [phase]: phaseRoutes },
      lastUpdated: new Date().toLocaleString("zh-CN"),
    };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
  };

  // ==========================================
  // 内部模拟审核 —— 两阶段（演示用）
  // ==========================================

  /** 计算发票上传截止日：起始日 + 7 个工作日 */
  const calculateInvoiceDeadline = (fromDate?: string): string => {
    const d = fromDate ? new Date(fromDate) : new Date();
    let added = 0;
    while (added < 7) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) { added++; }
    }
    return d.toISOString().split("T")[0];
  };

  // ── 旧的单阶段函数（@deprecated，委托到两阶段） ──

  /** @deprecated 请使用 simApproveSocietyVoucher / simApproveSocietyInvoice */
  const simApproveSocietyMembership = () => {
    const status = societyMembership.status;
    if (status === "voucher_submitted" || status === "pending") {
      simApproveSocietyVoucher();
    } else if (status === "invoice_submitted") {
      simApproveSocietyInvoice();
    }
  };

  /** @deprecated 请使用 simRejectSocietyVoucher / simRejectSocietyInvoice */
  const simRejectSocietyMembership = (reason: string) => {
    const status = societyMembership.status;
    if (status === "voucher_submitted" || status === "pending") {
      simRejectSocietyVoucher(reason);
    } else if (status === "invoice_submitted") {
      simRejectSocietyInvoice(reason);
    }
  };

  /** @deprecated 请使用 simApproveConferenceVoucher / simApproveConferenceInvoice */
  const simApproveConference = (confId: string) => {
    const reg = conferenceRegs[confId];
    if (!reg) return;
    if (reg.status === "voucher_submitted" || reg.status === "pending") {
      simApproveConferenceVoucher(confId);
    } else if (reg.status === "invoice_submitted") {
      simApproveConferenceInvoice(confId);
    }
  };

  /** @deprecated 请使用 simRejectConferenceVoucher / simRejectConferenceInvoice */
  const simRejectConference = (confId: string, reason: string) => {
    const reg = conferenceRegs[confId];
    if (!reg) return;
    if (reg.status === "voucher_submitted" || reg.status === "pending") {
      simRejectConferenceVoucher(confId, reason);
    } else if (reg.status === "invoice_submitted") {
      simRejectConferenceInvoice(confId, reason);
    }
  };

  // ── 会员费两阶段模拟审核（新） ──

  /** 凭证初审通过 → status = invoice_pending，设置发票截止日 */
  const simApproveSocietyVoucher = () => {
    if (!currentUser) return;

    const deadline = calculateInvoiceDeadline();
    const updatedHistory = societyMembership.history.map(h =>
      (h.status === "voucher_submitted" || h.status === "pending") && h.type === "society_fee"
        ? { ...h, status: "approved" as const, auditTime: new Date().toLocaleString("zh-CN") }
        : h
    );

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "invoice_pending",
      invoiceDeadline: deadline,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "学会会员费凭证初审已通过",
      content: `凭证初审已通过！请于 ${deadline} 前上传电子发票。您现在可以绑定专业分会。`,
      type: "success"
    });

    toast.success("凭证初审通过！请上传电子发票完成终审。");
  };

  /** 凭证初审驳回 → status = voucher_rejected */
  const simRejectSocietyVoucher = (reason: string) => {
    if (!currentUser) return;

    const updatedHistory = societyMembership.history.map(h =>
      (h.status === "voucher_submitted" || h.status === "pending") && h.type === "society_fee"
        ? { ...h, status: "rejected" as const, auditTime: new Date().toLocaleString("zh-CN"), rejectReason: reason }
        : h
    );

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "voucher_rejected",
      voucherRejectReason: reason,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "会员费凭证被驳回",
      content: `您提交的学会会员费凭证初审被驳回。原因：${reason}。请重新上传清晰的缴费凭证。`,
      type: "warning"
    });

    toast.error(`凭证驳回：${reason}`);
  };

  /** 发票终审通过 → status = active，设置有效期 */
  const simApproveSocietyInvoice = () => {
    if (!currentUser) return;

    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const expiryStr = d.toISOString().split("T")[0];

    const updatedHistory = societyMembership.history.map(h =>
      (h.status === "invoice_submitted") && h.type === "society_fee"
        ? { ...h, status: "approved" as const, auditTime: new Date().toLocaleString("zh-CN") }
        : h
    );

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "active",
      expiryDate: expiryStr,
      invoiceDeadline: undefined,
      invoiceExtendedDeadline: undefined,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "学会会员资格已生效",
      content: `发票终审已通过！会员资格正式生效，有效期至 ${expiryStr}。您现在可以绑定专业分会并参加学术会议。`,
      type: "success"
    });

    toast.success(`会员资格已生效，有效期至 ${expiryStr}。`);
  };

  /** 发票终审驳回 → status = invoice_rejected */
  const simRejectSocietyInvoice = (reason: string) => {
    if (!currentUser) return;

    const updatedHistory = societyMembership.history.map(h =>
      h.status === "invoice_submitted" && h.type === "society_fee"
        ? { ...h, status: "rejected" as const, auditTime: new Date().toLocaleString("zh-CN"), rejectReason: reason }
        : h
    );

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "invoice_rejected",
      invoiceRejectReason: reason,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "会员费发票被驳回",
      content: `您提交的电子发票终审被驳回。原因：${reason}。请重新上传发票。`,
      type: "warning"
    });

    toast.error(`发票驳回：${reason}`);
  };

  // ── 会议费两阶段模拟审核（新） ──

  /** 凭证初审通过 → status = invoice_pending，设置发票截止日，解锁参会信息填写 */
  const simApproveConferenceVoucher = (confId: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const deadline = calculateInvoiceDeadline();
    const confTitle = getConferenceTitle(confId);

    const updatedReg: ConferenceReg = {
      ...currentReg,
      status: "invoice_pending",
      voucherAuditTime: new Date().toLocaleString("zh-CN"),
      invoiceDeadline: deadline,
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议费凭证初审已通过",
      content: `【${confTitle}】凭证初审已通过！请于 ${deadline} 前上传电子发票。您现在可以填写参会信息。`,
      type: "success"
    });

    toast.success(`【${confTitle}】凭证初审通过！请填写参会信息并上传发票。`);
  };

  /** 凭证初审驳回 → status = voucher_rejected */
  const simRejectConferenceVoucher = (confId: string, reason: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const confTitle = getConferenceTitle(confId);
    const updatedReg: ConferenceReg = {
      ...currentReg,
      status: "voucher_rejected",
      voucherRejectReason: reason,
      voucherAuditTime: new Date().toLocaleString("zh-CN"),
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议费凭证被驳回",
      content: `【${confTitle}】凭证初审被驳回。原因：${reason}。请重新上传清晰的缴费凭证。`,
      type: "warning"
    });

    toast.error(`【${confTitle}】凭证驳回：${reason}`);
  };

  /** 发票终审通过 → status = confirmed */
  const simApproveConferenceInvoice = (confId: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const confTitle = getConferenceTitle(confId);
    const updatedReg: ConferenceReg = {
      ...currentReg,
      status: "confirmed",
      invoiceAuditTime: new Date().toLocaleString("zh-CN"),
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议报名已确认",
      content: `【${confTitle}】发票终审已通过！您已获得正式参会资格。`,
      type: "success"
    });

    toast.success(`【${confTitle}】报名已确认！`);
  };

  /** 发票终审驳回 → status = invoice_rejected */
  const simRejectConferenceInvoice = (confId: string, reason: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentUser) return;

    const confTitle = getConferenceTitle(confId);
    const updatedReg: ConferenceReg = {
      ...currentReg,
      status: "invoice_rejected",
      invoiceRejectReason: reason,
      invoiceAuditTime: new Date().toLocaleString("zh-CN"),
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议费发票被驳回",
      content: `【${confTitle}】电子发票终审被驳回。原因：${reason}。请重新上传发票。`,
      type: "warning"
    });

    toast.error(`【${confTitle}】发票驳回：${reason}`);
  };

  // ── 宽限期与过期处理 ──

  /** 检查并更新所有逾期发票记录 */
  const checkInvoiceOverdue = () => {
    if (!currentUser) return;

    const today = new Date().toISOString().split("T")[0];
    let hasChanges = false;

    // 1. 检查会员费发票是否逾期
    const memberDeadline = societyMembership.invoiceExtendedDeadline || societyMembership.invoiceDeadline;
    if (memberDeadline && today > memberDeadline && societyMembership.status === "invoice_pending") {
      const updatedMembership: SocietyMembership = {
        ...societyMembership,
        status: "invoice_overdue",
        frozenDueToExpiry: true
      };
      setSocietyMembership(updatedMembership);
      saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

      addNotification({
        title: "会员费发票上传已逾期",
        content: `发票上传截止日 ${memberDeadline} 已过，会员资格暂时锁定。请尽快上传发票以恢复会员资格。`,
        type: "warning"
      });
      hasChanges = true;
    }
    // 临近提醒（3天内）
    else if (memberDeadline && societyMembership.status === "invoice_pending") {
      const deadlineDate = new Date(memberDeadline);
      const todayDate = new Date(today);
      const daysLeft = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) {
        toast.warning(`会员费发票上传截止日还有 ${daysLeft} 天`);
      }
    }

    // 2. 检查各会议费发票是否逾期
    const updatedRegs = { ...conferenceRegs };
    for (const [confId, reg] of Object.entries(updatedRegs)) {
      const confDeadline = reg.invoiceExtendedDeadline || reg.invoiceDeadline;
      if (confDeadline && today > confDeadline && reg.status === "invoice_pending") {
        updatedRegs[confId] = {
          ...reg,
          status: "invoice_overdue",
          lastUpdated: new Date().toLocaleString("zh-CN")
        };
        hasChanges = true;
        const confTitle = getConferenceTitle(confId);
        addNotification({
          title: "会议费发票上传已逾期",
          content: `【${confTitle}】的发票上传截止日 ${confDeadline} 已过。请尽快上传发票以完成报名确认。`,
          type: "warning"
        });
      } else if (confDeadline && reg.status === "invoice_pending") {
        const deadlineDate = new Date(confDeadline);
        const todayDate = new Date(today);
        const daysLeft = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3 && daysLeft > 0) {
          toast.warning(`【${getConferenceTitle(confId)}】发票上传截止日还有 ${daysLeft} 天`);
        }
      }
    }

    if (hasChanges) {
      setConferenceRegs(updatedRegs);
      saveState(`paleo_confs_${currentUser.email}`, updatedRegs);
    }
  };

  /** 手动延长发票上传期限（后台操作） */
  const extendInvoiceDeadline = (confId: string, newDeadline: string, reason?: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) {
      toast.error("未找到该会议的报名记录。");
      return;
    }

    const updatedReg: ConferenceReg = {
      ...currentReg,
      invoiceExtendedDeadline: newDeadline,
      // 如果当前是逾期状态，恢复到待上传状态
      status: currentReg.status === "invoice_overdue" ? "invoice_pending" : currentReg.status,
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    const reasonNote = reason ? `（原因：${reason}）` : "";
    addNotification({
      title: "发票上传期限已延长",
      content: `【${confTitle}】的发票上传截止日已延长至 ${newDeadline}。${reasonNote}`,
      type: "info"
    });

    toast.success(`发票截止日已延长至 ${newDeadline}`);
  };

  /** 会员到期时的分级处理（§4.2） */
  const handleMembershipExpiry = () => {
    if (!currentUser) return;

    const updatedRegs = { ...conferenceRegs };
    let frozenCount = 0;
    let expiredCount = 0;

    for (const [confId, reg] of Object.entries(updatedRegs)) {
      switch (reg.status) {
        case "confirmed":
          // 资格保留，不动
          break;
        case "invoice_submitted":
          // 资格锁定
          updatedRegs[confId] = { ...reg, frozenDueToExpiry: true, lastUpdated: new Date().toLocaleString("zh-CN") };
          frozenCount++;
          break;
        case "voucher_submitted":
        case "voucher_rejected":
        case "invoice_pending":
        case "invoice_overdue":
        case "invoice_rejected":
        case "pending":
        case "approved_unfilled":
          // 自动失效
          delete updatedRegs[confId];
          expiredCount++;
          break;
      }
    }

    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    // 更新会员状态 → 超期视为自动退会，转为非会员身份（保留分会绑定，可继续以非会员参会）
    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "expired",
      frozenDueToExpiry: true
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    setUserType("non_member");
    localStorage.setItem(`paleo_user_type_${currentUser.email}`, "non_member");
    localStorage.setItem(`paleo_admin_user_type_${currentUser.email}`, "non_member");

    addNotification({
      title: "会员资格已到期 — 已自动转为非会员",
      content: `您的学会会员已到期，系统已自动解除会员资格，您可继续以非会员身份绑定学会并参会。${frozenCount > 0 ? `${frozenCount} 个待终审的会议报名已锁定。` : ""}${expiredCount > 0 ? `${expiredCount} 个未完成报名的会议已自动取消。` : ""}`,
      type: "warning"
    });
  };

  /** 续费后的恢复逻辑（§4.3） */
  const handleMembershipRenewal = () => {
    if (!currentUser) return;

    const updatedRegs = { ...conferenceRegs };
    let restoredCount = 0;

    for (const [confId, reg] of Object.entries(updatedRegs)) {
      if (reg.frozenDueToExpiry) {
        updatedRegs[confId] = { ...reg, frozenDueToExpiry: false, lastUpdated: new Date().toLocaleString("zh-CN") };
        restoredCount++;
      }
    }

    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    if (restoredCount > 0) {
      addNotification({
        title: "会议资格已恢复",
        content: `会员续费完成，${restoredCount} 个因会员到期而锁定的会议报名资格已恢复。请前往绑定分会。`,
        type: "success"
      });

      toast.info(`${restoredCount} 个会议资格已恢复。请手动重新绑定分会。`);
    }
  };

  // ==========================================
  // Phase 6: 入会/退会申请
  // ==========================================

  /** 提交入会申请书 → status = application_submitted */
  const submitMembershipApplicationAction = (applicationFileUrl: string, applicationFileName: string) => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    const app: MembershipApplication = {
      status: "application_submitted",
      applicationFileUrl,
      applicationFileName,
      submitTime: new Date().toLocaleString("zh-CN"),
    };

    setMembershipApplication(app);
    const email = currentUser.email;
    syncAdminApplication(email, "membership", app);
    syncAdminUserRegistry(currentUser);

    // 同步更新会员状态
    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "application_submitted",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "入会申请书已提交",
      content: "您的入会申请书已成功提交，管理员将在1-3个工作日内审核。审核通过后即可缴纳会费。",
      type: "info",
    });

    toast.success("入会申请书已提交，请等待管理员审核。");
  };

  /** 取消入会申请（仅在审核中时可用） */
  const cancelMembershipApplicationAction = () => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }
    if (!membershipApplication || membershipApplication.status !== "application_submitted") {
      toast.error("当前没有待审核的入会申请。");
      return;
    }

    setMembershipApplication(null);
    const email = currentUser.email;
    syncAdminApplication(email, "membership", null);

    // 恢复会员状态
    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "not_member",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "入会申请已取消",
      content: "您的入会申请书已取消。",
      type: "info",
    });

    toast.info("入会申请已取消。");
  };

  /** 提交退会申请书 → status = withdrawal_submitted */
  const submitWithdrawalApplicationAction = (applicationFileUrl: string, applicationFileName: string) => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    const app: WithdrawalApplication = {
      status: "withdrawal_submitted",
      applicationFileUrl,
      applicationFileName,
      submitTime: new Date().toLocaleString("zh-CN"),
    };

    setWithdrawalApplication(app);
    const email = currentUser.email;
    syncAdminApplication(email, "withdrawal", app);
    syncAdminUserRegistry(currentUser);

    // 同步更新会员状态
    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "withdrawal_submitted",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "退会申请已提交",
      content: "您的退会申请书已提交，管理员审核通过后会员资格将即时终止。已缴费的待参会订单保留，可继续以非会员身份参会。",
      type: "warning",
    });

    toast.success("退会申请已提交，请等待管理员审核。");
  };

  /** 取消退会申请（仅在审核中时可用） */
  const cancelWithdrawalApplicationAction = () => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }
    if (!withdrawalApplication || withdrawalApplication.status !== "withdrawal_submitted") {
      toast.error("当前没有待审核的退会申请。");
      return;
    }

    setWithdrawalApplication(null);
    const email = currentUser.email;
    syncAdminApplication(email, "withdrawal", null);

    // 恢复为 active 状态
    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "active",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "退会申请已取消",
      content: "您的退会申请书已取消，会员资格恢复正常。",
      type: "info",
    });

    toast.info("退会申请已取消。");
  };

  /** 获取入会申请书模板下载 URL */
  const getMembershipApplicationTemplateUrl = (): string => {
    const stored = localStorage.getItem("paleo_membership_application_template");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.url || "";
      } catch { return ""; }
    }
    return "";
  };

  /** 获取退会申请书模板下载 URL */
  const getWithdrawalApplicationTemplateUrl = (): string => {
    const stored = localStorage.getItem("paleo_withdrawal_application_template");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.url || "";
      } catch { return ""; }
    }
    return "";
  };

  // ── 入会/退会申请模拟审核（演示用） ──

  /** 模拟管理员通过入会申请 → application_approved（等同 AuditWorkbench approveMembershipApplication） */
  const simApproveMembershipApplication = () => {
    if (!currentUser) return;
    if (societyMembership.status !== "application_submitted" || !membershipApplication) {
      toast.error("当前没有待审核的入会申请。");
      return;
    }

    const email = currentUser.email;
    const reviewTime = new Date().toISOString();
    const updatedApp: MembershipApplication = {
      ...membershipApplication,
      status: "application_approved",
      reviewTime,
    };

    setMembershipApplication(updatedApp);
    syncAdminApplication(email, "membership", updatedApp);

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "application_approved",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "入会申请已通过",
      content: "您的入会申请书已审核通过，请前往会员服务缴纳会费完成入会。",
      type: "success",
    });
    toast.success("入会申请已审核通过（演示），请缴纳会费。");
  };

  /** 模拟管理员驳回入会申请 */
  const simRejectMembershipApplication = (reason: string) => {
    if (!currentUser) return;
    if (societyMembership.status !== "application_submitted" || !membershipApplication) {
      toast.error("当前没有待审核的入会申请。");
      return;
    }

    const email = currentUser.email;
    const reviewTime = new Date().toISOString();
    const updatedApp: MembershipApplication = {
      ...membershipApplication,
      status: "application_rejected",
      rejectReason: reason,
      reviewTime,
    };

    setMembershipApplication(updatedApp);
    syncAdminApplication(email, "membership", updatedApp);

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "application_rejected",
      applicationRejectReason: reason,
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "入会申请被驳回",
      content: `您的入会申请书被驳回。原因：${reason}。请修改后重新提交。`,
      type: "warning",
    });
    toast.error(`入会申请被驳回：${reason}`);
  };

  /** 模拟管理员通过退会申请 → withdrawn（等同 AuditWorkbench approveWithdrawalApplication） */
  const simApproveWithdrawalApplication = () => {
    if (!currentUser) return;
    if (societyMembership.status !== "withdrawal_submitted" || !withdrawalApplication) {
      toast.error("当前没有待审核的退会申请。");
      return;
    }

    const email = currentUser.email;
    const reviewTime = new Date().toISOString();
    const updatedApp: WithdrawalApplication = {
      ...withdrawalApplication,
      status: "withdrawn",
      reviewTime,
    };

    setWithdrawalApplication(updatedApp);
    syncAdminApplication(email, "withdrawal", updatedApp);

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "withdrawn",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    setUserType("non_member");
    localStorage.setItem(`paleo_user_type_${email}`, "non_member");
    localStorage.setItem(`paleo_admin_user_type_${email}`, "non_member");

    addNotification({
      title: "退会申请已通过",
      content: "您的退会申请已审核通过，会员资格已终止。已缴费的待参会订单保留。",
      type: "info",
    });
    toast.success("退会申请已通过（演示），会员资格已终止。");
  };

  /** 模拟管理员驳回退会申请 → 恢复 active */
  const simRejectWithdrawalApplication = (reason: string) => {
    if (!currentUser) return;
    if (societyMembership.status !== "withdrawal_submitted" || !withdrawalApplication) {
      toast.error("当前没有待审核的退会申请。");
      return;
    }

    const email = currentUser.email;
    const reviewTime = new Date().toISOString();
    const updatedApp: WithdrawalApplication = {
      ...withdrawalApplication,
      status: "withdrawal_rejected",
      rejectReason: reason,
      reviewTime,
    };

    setWithdrawalApplication(updatedApp);
    syncAdminApplication(email, "withdrawal", updatedApp);

    const updatedMembership: SocietyMembership = {
      ...societyMembership,
      status: "active",
      history: societyMembership.history,
    };
    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${email}`, updatedMembership);

    addNotification({
      title: "退会申请被驳回",
      content: `您的退会申请被驳回。原因：${reason}。会员资格保持不变。`,
      type: "warning",
    });
    toast.error(`退会申请被驳回：${reason}`);
  };

  const chooseMembershipPath = (path: "member" | "non_member") => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    setUserType(path);
    setMembershipChoiceMade(true);

    const email = currentUser.email;
    localStorage.setItem(`paleo_user_type_${email}`, path);
    localStorage.setItem(`paleo_choice_made_${email}`, "true");
    localStorage.setItem(`paleo_admin_user_type_${email}`, path);
    localStorage.setItem(`paleo_admin_choice_made_${email}`, "true");

    if (path === "member") {
      addNotification({
        title: "已选择：成为正式会员",
        content: "请前往会员服务页面完成会费缴纳和身份验证，通过后即可享受会员价参会。",
        type: "info"
      });
    } else {
      addNotification({
        title: "已选择：作为非会员使用",
        content: "您可以直接绑定分会并注册会议，会议费将按非会员标准收取。您可随时在会员服务中升级为正式会员。",
        type: "info"
      });
    }
  };

  // ── 配置读取 ──

  const getMembershipFee = (memberType?: string): number => {
    return getConfiguredMembershipFee(memberType);
  };

  const getConferenceFeeAction = (confId: string): number => {
    const existingReg = conferenceRegs[confId];
    if (existingReg?.lockedAmount != null && existingReg.lockedAmount > 0) {
      return existingReg.lockedAmount;
    }
    const feeType = deriveFeeType(userType, currentUser?.isStudent ?? (currentUser?.role === "学生"));
    return getConferenceFeeByType(confId, feeType);
  };

  // Phase 0: New fee type API
  const getUserFeeType = (): ConferenceFeeType => {
    return deriveFeeType(userType, currentUser?.isStudent ?? (currentUser?.role === "学生"));
  };

  const getConferenceFeeConfigAction = (confId: string): ConferenceFeeConfig => {
    return getConfiguredFeeConfig(confId);
  };

  // Phase F1: File download helpers — 盖章通知和摘要模板仅在缴费终审 confirmed 后解锁
  const isConferenceConfirmed = (confId: string): boolean => {
    const reg = conferenceRegs[confId];
    if (!reg) return false;
    return CONFIRMED_PAYMENT_STATUSES.includes(reg.status as typeof CONFIRMED_PAYMENT_STATUSES[number]);
  };

  const canDownloadStampedNotice = (confId: string): boolean => isConferenceConfirmed(confId);

  const canDownloadAbstractTemplate = (confId: string): boolean => isConferenceConfirmed(confId);

  const canAccessConferenceForm = (confId: string): boolean => isConferenceConfirmed(confId);

  const getConferenceFileUrl = (confId: string, fileType: "stampedNotice" | "abstractTemplate" | "publicNotice"): string | null => {
    const confs = JSON.parse(localStorage.getItem("paleo_admin_conferences_db") || "[]");
    const conf = confs.find((c: { id: string }) => c.id === confId);
    if (!conf) return null;
    if (fileType === "stampedNotice") return conf.stampedNoticeUrl || null;
    if (fileType === "abstractTemplate") return conf.abstractTemplateUrl || null;
    return conf.publicNoticeUrl || null;
  };

  // ==========================================
  // HELPERS & GENERAL
  // ==========================================

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    if (currentUser) {
      saveState(`paleo_notifs_${currentUser.email}`, updated);
    }
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (currentUser) {
      saveState(`paleo_notifs_${currentUser.email}`, updated);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (currentUser) {
      saveState(`paleo_notifs_${currentUser.email}`, []);
    }
    toast.success("消息中心已清空。");
  };

  const getBranchName = (id: string): string => {
    if (ALL_SOCIETY_UNITS[id]) return ALL_SOCIETY_UNITS[id];
    // 优先使用 shared/constants 的 BRANCH_MAP（字符串 ID，如 "wtxfh"）
    const stringMap: { [key: string]: string } = {
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
    if (stringMap[id]) return stringMap[id];
    // 兼容旧的数字 ID 格式
    const numericMap: { [key: string]: string } = {
      "1": "古无脊椎动物学分会",
      "2": "科普工作委员会",
      "3": "孢粉学分会",
      "4": "微体学分会",
      "5": "化石藻类专业委员会",
      "6": "古植物学分会",
      "7": "地球生物学分会",
      "8": "古生态专业分会",
      "9": "古脊椎动物学分会",
      "10": "生物沉积学分会",
      "11": "新技术新方法专业委员会"
    };
    return numericMap[id] || "学术分会";
  };

  const getConferenceTitle = (id: string): string => {
    const c: { [key: string]: string } = {
      "demo-conf": "【演示会议】古无脊椎动物学学术工作坊",
      "conf-1": "第十五届全国微体古生物学学术研讨会",
      "conf-2": "2026年度古植物学与环境演变论坛",
      "conf-3": "热河生物群国际学术研讨会",
      "conf-4": "第十二届全国古脊椎动物学学术年会",
      "conf-5": "中国孢粉学会第十届全国学术大会",
      "conf-6": "古生态学与古环境重建国际研讨会",
      "conf-7": "地球生物学前沿论坛",
      "conf-8": "古生物学新技术新方法专题研讨会",
      "conf-zgswxh-1": "中国古生物学会第32届学术年会",
      "conf-zgswxh-2": "中国古生物学会国际古生物学前沿论坛",
    };
    return c[id] || "学术会议";
  };

  const getConferenceBranchId = (confId: string): string | null => {
    // 使用 shared/constants.ts CONFERENCE_BRANCH_MAP 中的实际学会/分会 ID
    const map: { [key: string]: string } = {
      "conf-1": "wtxfh",     // 微体学分会
      "conf-2": "gzwxfh",    // 古植物学分会
      "conf-3": "gjzdw",     // 古脊椎动物学分会
      "conf-4": "gjzdw",     // 古脊椎动物学分会
      "conf-5": "bfxfh",     // 孢粉学分会
      "conf-6": "gst",       // 古生态专业分会
      "conf-7": "dqswx",     // 地球生物学分会
      "conf-8": "xjsxff",    // 新技术新方法专业委员会
      "demo-conf": "gwjzdwxfh", // 古无脊椎动物学分会
      "conf-zgswxh-1": "zgswxh", // 中国古生物学会（总学会）
      "conf-zgswxh-2": "zgswxh", // 中国古生物学会（总学会）
    };
    return map[confId] || null;
  };

  /** 获取会议费金额（用于 OCR 比对，优先使用报名时锁定的金额） */
  const getConferenceFee = (confId: string): number => getConferenceFeeAction(confId);

  return (
    <MembershipContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      societyMembership,
      boundBranches,
      conferenceRegs,
      notifications,
      allUsers,
      register,
      login,
      logout,
      deleteAccount,
      updateProfile,
      resetPassword,
      applySocietyMembership,
      submitMembershipVoucher,
      submitMembershipInvoice,
      toggleBranchBinding,
      payConference,
      submitConferenceVoucher,
      submitConferenceInvoice,
      submitConferenceForm,
      deleteAbstract,
      uploadAbstract,
      uploadAbstractFile,
      setAccommodation,
      toggleFieldTripRoute,
      simApproveSocietyMembership,
      simRejectSocietyMembership,
      simApproveConference,
      simRejectConference,
      simApproveSocietyVoucher,
      simRejectSocietyVoucher,
      simApproveSocietyInvoice,
      simRejectSocietyInvoice,
      simApproveConferenceVoucher,
      simRejectConferenceVoucher,
      simApproveConferenceInvoice,
      simRejectConferenceInvoice,
      checkInvoiceOverdue,
      extendInvoiceDeadline,
      handleMembershipExpiry,
      handleMembershipRenewal,
      getMembershipFee,
      getConferenceFee: getConferenceFeeAction,
      getUserFeeType,
      getConferenceFeeConfig: getConferenceFeeConfigAction,
      canDownloadStampedNotice,
      canDownloadAbstractTemplate,
      canAccessConferenceForm,
      getConferenceFileUrl,
      // Phase 6: 入会/退会申请
      membershipApplication,
      withdrawalApplication,
      submitMembershipApplication: submitMembershipApplicationAction,
      cancelMembershipApplication: cancelMembershipApplicationAction,
      submitWithdrawalApplication: submitWithdrawalApplicationAction,
      cancelWithdrawalApplication: cancelWithdrawalApplicationAction,
      getMembershipApplicationTemplateUrl,
      getWithdrawalApplicationTemplateUrl,
      simApproveMembershipApplication,
      simRejectMembershipApplication,
      simApproveWithdrawalApplication,
      simRejectWithdrawalApplication,
      userType,
      membershipChoiceMade,
      chooseMembershipPath,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications
    }}>
      {children}
    </MembershipContext.Provider>
  );
};

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  return context;
};
