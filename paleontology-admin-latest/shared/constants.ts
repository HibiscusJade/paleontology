// ============================================================================
// 共享常量：会员费配置、会议状态枚举、分会 ID 映射
// Phase 1: 数据模型底层
// ============================================================================

// ── 会员费金额配置（前端默认值，可被后台配置覆盖） ────────────────────────────

export const MEMBERSHIP_FEE_CONFIG = {
  default: {
    standard: 200,    // 普通会员
    student: 100,     // 学生会员（预留）
    corporate: 5000,  // 单位会员（预留）
  },
  currentYear: 2026,
} as const;

/** 原型阶段从 localStorage 读取配置，fallback 到默认值 */
export function getMembershipFee(memberType: string = "standard"): number {
  const stored = localStorage.getItem("paleo_membership_fee_config");
  if (stored) {
    try {
      const config = JSON.parse(stored);
      if (config[memberType] !== undefined) {
        return config[memberType];
      }
    } catch {
      // fallback
    }
  }
  return MEMBERSHIP_FEE_CONFIG.default[memberType as keyof typeof MEMBERSHIP_FEE_CONFIG.default] ?? MEMBERSHIP_FEE_CONFIG.default.standard;
}

// ── 会议费缴纳两阶段状态枚举 ──────────────────────────────────────────────

/** 会议注册费状态（两阶段审核） */
export const CONFERENCE_STATUS = {
  UNPAID:              "unpaid",
  VOUCHER_SUBMITTED:   "voucher_submitted",   // 凭证已上传，待初审
  VOUCHER_REJECTED:    "voucher_rejected",    // 凭证初审驳回
  INVOICE_PENDING:     "invoice_pending",     // 初审通过，待上传发票（可填参会信息）
  INVOICE_OVERDUE:     "invoice_overdue",     // 发票逾期未上传
  INVOICE_SUBMITTED:   "invoice_submitted",   // 发票已上传，待终审
  INVOICE_REJECTED:    "invoice_rejected",    // 发票终审驳回
  CONFIRMED:           "confirmed",           // 终审通过，报名确认
} as const;

export type ConferenceStatus = typeof CONFERENCE_STATUS[keyof typeof CONFERENCE_STATUS];

/** 学会会员费状态（两阶段审核） */
export const MEMBERSHIP_STATUS = {
  NOT_MEMBER:          "not_member",
  VOUCHER_SUBMITTED:   "voucher_submitted",   // 凭证已上传，待初审
  VOUCHER_REJECTED:    "voucher_rejected",    // 凭证初审驳回
  INVOICE_PENDING:     "invoice_pending",     // 初审通过，待上传发票
  INVOICE_OVERDUE:     "invoice_overdue",     // 发票逾期未上传
  INVOICE_SUBMITTED:   "invoice_submitted",   // 发票已上传，待终审
  INVOICE_REJECTED:    "invoice_rejected",    // 发票终审驳回
  ACTIVE:              "active",              // 正式会员
  EXPIRED:             "expired",             // 已过期
} as const;

export type MembershipStatus = typeof MEMBERSHIP_STATUS[keyof typeof MEMBERSHIP_STATUS];

// ── 用户类型枚举（双路径选择） ───────────────────────────────────────────────

export const USER_TYPE = {
  REGULAR:      "regular",       // 普通用户，未做选择
  NON_MEMBER:   "non_member",    // 非会员（路径A）
  MEMBER:       "member",        // 正式会员（路径B）
} as const;

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];

export const USER_TYPE_LABEL: Record<string, string> = {
  regular:     "普通用户",
  non_member:  "非会员",
  member:      "正式会员",
};

// ── 状态 → UI 标签映射 ────────────────────────────────────────────────────

export const CONFERENCE_STATUS_LABEL: Record<string, string> = {
  unpaid:             "未缴费",
  voucher_submitted:  "凭证初审中",
  voucher_rejected:   "凭证被驳回",
  invoice_pending:    "待上传发票",
  invoice_overdue:    "发票逾期",
  invoice_submitted:  "发票终审中",
  invoice_rejected:   "发票被驳回",
  confirmed:          "✓ 已确认",
};

export const CONFERENCE_STATUS_COLOR: Record<string, string> = {
  unpaid:             "bg-gray-50 text-gray-500 border border-gray-200",
  voucher_submitted:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  voucher_rejected:   "bg-red-50 text-red-700 border border-red-200",
  invoice_pending:    "bg-blue-50 text-blue-700 border border-blue-200",
  invoice_overdue:    "bg-orange-50 text-orange-700 border border-orange-200",
  invoice_submitted:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  invoice_rejected:   "bg-red-50 text-red-700 border border-red-200",
  confirmed:          "bg-green-50 text-green-700 border border-green-200",
};

export const MEMBERSHIP_STATUS_LABEL: Record<string, string> = {
  not_member:         "尚未入会",
  voucher_submitted:  "凭证初审中",
  voucher_rejected:   "凭证被驳回",
  invoice_pending:    "待上传发票",
  invoice_overdue:    "发票逾期",
  invoice_submitted:  "发票终审中",
  invoice_rejected:   "发票被驳回",
  active:             "✓ 会员资格有效",
  expired:            "已过期",
};

// ── 分会 ID 映射（集中管理，避免 Services.tsx / PersonalCenter.tsx 重复定义） ──

export const BRANCH_MAP: Record<string, string> = {
  gwjzdwxfh: "古无脊椎动物学分会",
  kpgzwyh:   "科普工作委员会",
  bfxfh:     "孢粉学分会",
  wtxfh:     "微体学分会",
  hszlzwyh:  "化石藻类专业委员会",
  gzwxfh:    "古植物学分会",
  dqswx:     "地球生物学分会",
  gst:       "古生态专业分会",
  gjzdw:     "古脊椎动物学分会",
  swcj:      "生物沉积学分会",
  xjsxff:    "新技术新方法专业委员会",
};

export const VALID_BRANCH_IDS = new Set(Object.keys(BRANCH_MAP));

/** 会议 ID → 所属分会 ID 映射 */
export const CONFERENCE_BRANCH_MAP: Record<string, string> = {
  "conf-1": "wtxfh",    // 微体学分会
  "conf-2": "gzwxfh",   // 古植物学分会
  "conf-3": "gjzdw",    // 古脊椎动物学分会
  "conf-4": "gjzdw",    // 古脊椎动物学分会
  "conf-5": "bfxfh",    // 孢粉学分会
  "conf-6": "gst",      // 古生态专业分会
  "conf-7": "dqswx",    // 地球生物学分会
  "conf-8": "xjsxff",   // 新技术新方法专业委员会
  "demo-conf": "gwjzdwxfh", // 演示会议
};

// ── 宽限期常量 ────────────────────────────────────────────────────────────

/** 发票上传宽限期（工作日） */
export const INVOICE_GRACE_PERIOD_WORKDAYS = 7;

/** 发票截止日临近提醒阈值（天） */
export const INVOICE_DEADLINE_WARNING_DAYS = 3;

// ── 会议费非会员价配置（会员价 +10%） ──────────────────────────────────────

/** 会议 ID → 会员价映射 */
export const CONFERENCE_FEE_MEMBER: Record<string, number> = {
  "demo-conf": 300,
  "conf-1": 1200,
  "conf-2": 800,
  "conf-3": 1500,
  "conf-4": 1000,
  "conf-5": 900,
  "conf-6": 1100,
  "conf-7": 600,
  "conf-8": 500,
};

/** 根据用户类型获取会议费 */
export function getConferenceFee(confId: string, userType: string): number {
  const memberFee = CONFERENCE_FEE_MEMBER[confId] ?? 1000;
  if (userType === "non_member") {
    return Math.round(memberFee * 1.1);
  }
  return memberFee;
}
