import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
}

// 统一学会会员状态（不再按分会）
export interface SocietyMembership {
  status: "not_member" | "pending" | "active" | "expired";
  expiryDate?: string;
  rejectReason?: string;
  history: PaymentRecord[];
}

export interface ConferenceReg {
  status: "unpaid" | "pending" | "approved_unfilled" | "submitted" | "approved_invoice";
  paymentVoucher?: string;
  invoice?: string;
  // Form fields
  name: string;
  gender: "男" | "女";
  unit: string;
  role: "学生" | "教师" | "嘉宾";
  accommodation: "单间" | "双人间" | "自行安排";
  session: string;
  presentationType: "口头报告" | "展板报告" | "仅参会";
  reportTitle?: string;
  abstractFileName?: string;
  lastUpdated?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

interface MembershipContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  societyMembership: SocietyMembership;
  boundBranches: string[]; // 已绑定的分会 ID 列表
  conferenceRegs: { [confId: string]: ConferenceReg };
  notifications: SystemNotification[];
  allUsers: User[];

  // Auth actions
  register: (user: User, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  resetPassword: (email: string) => void;

  // 统一学会会员费缴纳
  applySocietyMembership: (voucherUrl: string, invoiceUrl: string, amount: number) => void;

  // 分会绑定/解绑（无需审核，仅需有效会员资格）
  toggleBranchBinding: (branchId: string) => void;

  // Conference actions
  payConference: (confId: string, voucherUrl: string, invoiceUrl: string, amount: number) => void;
  submitConferenceForm: (confId: string, formData: Omit<ConferenceReg, "status" | "paymentVoucher" | "invoice">) => void;
  deleteAbstract: (confId: string) => void;
  uploadAbstract: (confId: string, fileName: string) => void;

  // 内部模拟审核（用于演示流程闭环，不作为后台管理页面）
  simApproveSocietyMembership: () => void;
  simRejectSocietyMembership: (reason: string) => void;
  simApproveConference: (confId: string) => void;
  simRejectConference: (confId: string, reason: string) => void;

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
    const cleanBranches = [...new Set<string>(parsedBranches.filter((id: string) => VALID_BRANCH_IDS.has(id)))];
    setBoundBranches(cleanBranches);
    // 如果数据被清理了，同步写回 localStorage
    if (cleanBranches.length !== parsedBranches.length) {
      localStorage.setItem(branchesKey, JSON.stringify(cleanBranches));
    }

    const storedConfs = localStorage.getItem(confsKey);
    setConferenceRegs(storedConfs ? JSON.parse(storedConfs) : {});

    const storedNotifs = localStorage.getItem(notifsKey);
    setNotifications(storedNotifs ? JSON.parse(storedNotifs) : DEFAULT_NOTIFICATIONS);
  };

  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
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
    toast.info("您已安全退出登录。");
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
  // 统一学会会员费
  // ==========================================

  const applySocietyMembership = (voucherUrl: string, invoiceUrl: string, amount: number) => {
    if (!currentUser) {
      toast.error("请先登录系统。");
      return;
    }

    const newRecord: PaymentRecord = {
      id: `rec-s-${Date.now()}`,
      type: "society_fee",
      targetName: "中国古生物学会会员费",
      amount,
      voucherUrl,
      invoiceUrl,
      submitTime: new Date().toLocaleString("zh-CN"),
      status: "pending"
    };

    const updatedMembership: SocietyMembership = {
      status: "pending",
      history: [newRecord, ...societyMembership.history]
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "学会会员费缴纳凭证已提交",
      content: `您已成功提交中国古生物学会会员费缴纳凭证（金额：¥${amount}）。财务人员将在 1-3 个工作日内完成审核，审核通过后会员资格立即生效。`,
      type: "info"
    });

    toast.success("会员费凭证提交成功，请等待财务审核。");
  };

  // ==========================================
  // 分会绑定/解绑
  // ==========================================

  const toggleBranchBinding = (branchId: string) => {
    if (!currentUser) {
      toast.error("请先登录系统。");
      return;
    }

    if (societyMembership.status !== "active") {
      toast.error("您必须是有效的学会会员才能绑定分会，请先缴纳学会会员费并等待审核通过。");
      return;
    }

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
      updatedBranches = [...new Set<string>([...boundBranches, branchId])];
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
  // CONFERENCE ACTIONS
  // ==========================================

  const payConference = (confId: string, voucherUrl: string, invoiceUrl: string, amount: number) => {
    if (!currentUser) return;

    if (societyMembership.status !== "active") {
      toast.error("您必须是有效的学会会员才能参加会议，请先缴纳学会会员费。");
      return;
    }

    const confTitle = getConferenceTitle(confId);
    const confBranchId = getConferenceBranchId(confId);
    if (confBranchId && !boundBranches.includes(confBranchId)) {
      toast.error(`您需要先绑定该会议所属的分会（${getBranchName(confBranchId)}），才能缴纳会议注册费。`);
      return;
    }

    const updatedReg: ConferenceReg = {
      ...(conferenceRegs[confId] || {
        name: currentUser.name,
        gender: currentUser.gender,
        unit: currentUser.unit,
        role: currentUser.role,
        accommodation: "自行安排",
        session: "待选择",
        presentationType: "仅参会"
      }),
      status: "pending",
      paymentVoucher: voucherUrl,
      invoice: invoiceUrl,
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    addNotification({
      title: "会议注册费凭证已提交",
      content: `您已成功提交【${confTitle}】的会议注册费凭证（金额：¥${amount}）。审核通过后，您即可填写参会信息。`,
      type: "info"
    });

    toast.success(`【${confTitle}】会议费凭证提交成功，请等待财务审核。`);
  };

  const submitConferenceForm = (confId: string, formData: Omit<ConferenceReg, "status" | "paymentVoucher" | "invoice">) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg || (currentReg.status !== "approved_unfilled" && currentReg.status !== "submitted")) {
      toast.error("请先缴纳会议注册费并等待审核通过后再填写参会信息。");
      return;
    }

    const updatedReg: ConferenceReg = {
      ...currentReg,
      ...formData,
      status: "submitted",
      lastUpdated: new Date().toLocaleString("zh-CN")
    };

    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    addNotification({
      title: "参会信息已更新",
      content: `您已成功提交/更新了在【${confTitle}】中的参会信息，系统已自动向您的注册邮箱发送确认邮件。`,
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

  // ==========================================
  // 内部模拟审核（演示用，不作为后台管理页面）
  // ==========================================

  const simApproveSocietyMembership = () => {
    if (!currentUser) return;

    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const expiryStr = d.toISOString().split("T")[0];

    const updatedHistory = societyMembership.history.map(h =>
      h.status === "pending" && h.type === "society_fee"
        ? { ...h, status: "approved" as const, auditTime: new Date().toLocaleString("zh-CN") }
        : h
    );

    const updatedMembership: SocietyMembership = {
      status: "active",
      expiryDate: expiryStr,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "学会会员资格已生效",
      content: `您的中国古生物学会会员费缴纳凭证已审核通过！会员资格正式生效，有效期至 ${expiryStr}。您现在可以绑定专业分会并参加学术会议。`,
      type: "success"
    });

    toast.success(`会员资格已生效，有效期至 ${expiryStr}。`);
  };

  const simRejectSocietyMembership = (reason: string) => {
    if (!currentUser) return;

    const updatedHistory = societyMembership.history.map(h =>
      h.status === "pending" && h.type === "society_fee"
        ? { ...h, status: "rejected" as const, auditTime: new Date().toLocaleString("zh-CN"), rejectReason: reason }
        : h
    );

    const updatedMembership: SocietyMembership = {
      status: "not_member",
      rejectReason: reason,
      history: updatedHistory
    };

    setSocietyMembership(updatedMembership);
    saveState(`paleo_society_membership_${currentUser.email}`, updatedMembership);

    addNotification({
      title: "会员费凭证审核被驳回",
      content: `您提交的学会会员费凭证被驳回。原因：${reason}。请重新上传清晰的缴费凭证。`,
      type: "warning"
    });

    toast.error("审核驳回（模拟）。");
  };

  const simApproveConference = (confId: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const newStatus = currentReg.abstractFileName || currentReg.presentationType !== "仅参会"
      ? "approved_invoice"
      : "approved_unfilled";

    const updatedReg: ConferenceReg = { ...currentReg, status: newStatus, lastUpdated: new Date().toLocaleString("zh-CN") };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    addNotification({
      title: "会议注册费审核通过",
      content: `您提交的【${confTitle}】会议注册费凭证已审核通过！您已获得参会资格，请尽快填写参会信息。`,
      type: "success"
    });

    toast.success(`【${confTitle}】会议费审核通过（模拟）。`);
  };

  const simRejectConference = (confId: string, reason: string) => {
    if (!currentUser) return;

    const currentReg = conferenceRegs[confId];
    if (!currentReg) return;

    const updatedReg: ConferenceReg = { ...currentReg, status: "unpaid", lastUpdated: new Date().toLocaleString("zh-CN") };
    const updatedRegs = { ...conferenceRegs, [confId]: updatedReg };
    setConferenceRegs(updatedRegs);
    saveState(`paleo_confs_${currentUser.email}`, updatedRegs);

    const confTitle = getConferenceTitle(confId);
    addNotification({
      title: "会议注册费凭证被驳回",
      content: `您提交的【${confTitle}】会议注册费凭证被驳回。原因：${reason}。请重新上传清晰凭证。`,
      type: "warning"
    });

    toast.error(`【${confTitle}】会议费审核驳回（模拟）。`);
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
    const b: { [key: string]: string } = {
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
    return b[id] || "学术分会";
  };

  const getConferenceTitle = (id: string): string => {
    const c: { [key: string]: string } = {
      "conf-1": "第十五届全国微体古生物学学术研讨会",
      "conf-2": "2026年度古植物学与环境演变论坛",
      "conf-3": "热河生物群国际学术研讨会",
      "conf-4": "第十二届全国古脊椎动物学学术年会",
      "conf-5": "中国孢粉学会第十届全国学术大会"
    };
    return c[id] || "学术会议";
  };

  const getConferenceBranchId = (confId: string): string | null => {
    const map: { [key: string]: string } = {
      "conf-1": "4",  // 微体学分会
      "conf-2": "6",  // 古植物学分会
      "conf-3": "9",  // 古脊椎动物学分会
      "conf-4": "9",  // 古脊椎动物学分会
      "conf-5": "3"   // 孢粉学分会
    };
    return map[confId] || null;
  };

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
      updateProfile,
      resetPassword,
      applySocietyMembership,
      toggleBranchBinding,
      payConference,
      submitConferenceForm,
      deleteAbstract,
      uploadAbstract,
      simApproveSocietyMembership,
      simRejectSocietyMembership,
      simApproveConference,
      simRejectConference,
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
