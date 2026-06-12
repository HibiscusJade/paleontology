# 会员双路径系统 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将会员系统从单一强制入会改为"非会员 / 正式会员"双路径，首次登录强制选择，会议费区分会员/非会员双价。

**Architecture:** 在 MembershipContext 新增 `userType` 三层身份(regular/non_member/member)，新增 `MembershipChoiceDialog` 组件处理首次登录决策，改写分支绑定和会议报名权限检查从会员状态改为 userType，会议数据增加双价配置。

**Tech Stack:** React 19, TypeScript, wouter, localStorage 持久化

---

### Task 1: shared/constants.ts — 新增用户类型枚举与会议双价

**Files:**
- Modify: `shared/constants.ts`

- [ ] **Step 1: 在 MEMBERSHIP_STATUS 之后新增 USER_TYPE 枚举**

在 `MEMBERSHIP_STATUS` 块之后（约第62行后），新增：

```typescript
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
```

- [ ] **Step 2: 新增会议非会员价配置**

在 `INVOICE_DEADLINE_WARNING_DAYS` 之后，新增：

```typescript
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
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
pnpm check
```

- [ ] **Step 4: Commit**

```bash
git add shared/constants.ts
git commit -m "feat: add USER_TYPE enum and dual conference fee config"
```

---

### Task 2: MembershipContext — 新增 userType 状态与 chooseMembershipPath

**Files:**
- Modify: `client/src/contexts/MembershipContext.tsx`

- [ ] **Step 1: 导入新类型**

修改文件顶部的 import（约第1-9行）：

```typescript
import {
  type ConferenceStatus,
  type MembershipStatus,
  CONFERENCE_STATUS,
  MEMBERSHIP_STATUS,
  USER_TYPE,
  type UserType,
  getMembershipFee as getConfiguredMembershipFee,
  getConferenceFee as getConfiguredConferenceFee,
} from "@shared/constants";
```

- [ ] **Step 2: 在 interface MembershipContextType 中新增字段**

在 `interface MembershipContextType` 中（约第102行附近，`allUsers` 之后、auth actions 之前），新增：

```typescript
  // ── 双路径选择（新增） ──
  userType: UserType;
  membershipChoiceMade: boolean;
  chooseMembershipPath: (path: "member" | "non_member") => void;
```

在 `getMembershipFee` 后面新增：

```typescript
  getConferenceFee: (confId: string) => number;
```

- [ ] **Step 3: 新增 userType 和 membershipChoiceMade state**

在 `MembershipProvider` 组件内，现有 state 声明之后（约第244行后），新增：

```typescript
  const [userType, setUserType] = useState<UserType>("regular");
  const [membershipChoiceMade, setMembershipChoiceMade] = useState(false);
```

- [ ] **Step 4: 在 loadUserState 中加载 userType**

在 `loadUserState` 函数内（约第265行），新增：

```typescript
    const typeKey = `paleo_user_type_${email}`;
    const storedType = localStorage.getItem(typeKey);
    setUserType((storedType as UserType) || "regular");

    const choiceKey = `paleo_choice_made_${email}`;
    setMembershipChoiceMade(localStorage.getItem(choiceKey) === "true");
```

- [ ] **Step 5: 新增 chooseMembershipPath action**

在 `getMembershipFee` 函数之前（约第1176行），新增：

```typescript
  const chooseMembershipPath = (path: "member" | "non_member") => {
    if (!currentUser) { toast.error("请先登录系统。"); return; }

    setUserType(path);
    setMembershipChoiceMade(true);

    const email = currentUser.email;
    localStorage.setItem(`paleo_user_type_${email}`, path);
    localStorage.setItem(`paleo_choice_made_${email}`, "true");

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
```

- [ ] **Step 6: 改写 toggleBranchBinding 权限检查**

修改 `toggleBranchBinding` 函数开头的权限检查（约第490-499行），将：

```typescript
    const canBind = societyMembership.status === "active" || societyMembership.status === "invoice_pending" || societyMembership.status === "invoice_submitted";
    if (!canBind) {
      toast.error("您必须是有效的学会会员才能绑定分会，请先缴纳学会会员费并等待审核通过。");
      return;
    }
```

替换为：

```typescript
    if (userType === "regular") {
      toast.error("请先选择您的参与方式（会员/非会员）后再绑定分会。");
      return;
    }
    if (userType === "member" && societyMembership.status !== "active" && societyMembership.status !== "invoice_pending" && societyMembership.status !== "invoice_submitted") {
      toast.error("您尚未完成会员缴费验证，请先前往会员服务完成入会流程。");
      return;
    }
```

- [ ] **Step 7: 改写 submitConferenceVoucher 权限检查**

修改 `submitConferenceVoucher` 函数开头的权限检查（约第542-546行），将：

```typescript
    const canAttend = societyMembership.status === "active" || societyMembership.status === "invoice_pending" || societyMembership.status === "invoice_submitted";
    if (!canAttend) {
      toast.error("您必须是有效的学会会员才能参加会议，请先缴纳学会会员费。");
      return;
    }
```

替换为：

```typescript
    if (userType === "regular") {
      toast.error("请先选择您的参与方式（会员/非会员）后再报名会议。");
      return;
    }
    if (userType === "member" && societyMembership.status !== "active" && societyMembership.status !== "invoice_pending" && societyMembership.status !== "invoice_submitted") {
      toast.error("您尚未完成会员缴费验证，请先前往会员服务完成入会流程后再报名会议。");
      return;
    }
```

- [ ] **Step 8: 新增 getConferenceFee 并更新 amount 获取方式**

在 `submitConferenceVoucher` 中，将通知里的金额显示改为从 context 的 getConferenceFee 获取：

在 `getMembershipFee` 函数旁边，新增：

```typescript
  const getConferenceFeeAction = (confId: string): number => {
    return getConfiguredConferenceFee(confId, userType);
  };
```

修改 `submitConferenceVoucher` 中的通知文案使用 `getConferenceFeeAction(confId)` 计算实际金额。

- [ ] **Step 9: 更新 Provider value**

在 `return` 的 `<MembershipContext.Provider value={{...}}>` 中新增（约第1290行后）：

```typescript
      userType,
      membershipChoiceMade,
      chooseMembershipPath,
      getConferenceFee: getConferenceFeeAction,
```

- [ ] **Step 10: 验证编译**

```bash
pnpm check
```

- [ ] **Step 11: Commit**

```bash
git add client/src/contexts/MembershipContext.tsx
git commit -m "feat: add userType state, chooseMembershipPath, and permission rewrites"
```

---

### Task 3: MembershipChoiceDialog — 新增首次登录决策弹窗组件

**Files:**
- Create: `client/src/components/MembershipChoiceDialog.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
import React from "react";
import { useMembership } from "../contexts/MembershipContext";
import { toast } from "sonner";

interface MembershipChoiceDialogProps {
  open: boolean;
}

export default function MembershipChoiceDialog({ open }: MembershipChoiceDialogProps) {
  const { chooseMembershipPath, getMembershipFee } = useMembership();

  if (!open) return null;

  const handleChooseNonMember = () => {
    chooseMembershipPath("non_member");
    toast.success("已选择作为非会员使用，可直接绑定分会和报名会议。");
  };

  const handleChooseMember = () => {
    chooseMembershipPath("member");
    toast.success("已选择成为正式会员，请前往会员服务完成缴费验证。");
  };

  const SOCIETY_FEE = getMembershipFee("standard");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E1DA] rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#002B49] text-white px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold font-serif tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
              欢迎来到中国古生物学会
            </h2>
            <p className="text-white/70 text-xs mt-1">WELCOME TO PSC DIGITAL PLATFORM</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-center text-sm text-slate-600 mb-8 leading-relaxed">
            请选择您的参与方式
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Option A: 成为正式会员 */}
            <div className="border-2 border-[#002B49] rounded-xl p-6 flex flex-col items-center text-center bg-[#FCFAF7]">
              <h3 className="text-base font-bold text-[#002B49] mb-2">成为正式会员</h3>
              <p className="text-2xl font-bold text-[#002B49] mb-1">¥{SOCIETY_FEE}<span className="text-xs font-normal text-slate-500">/年</span></p>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-5 text-left w-full">
                <li>· 享受会员价参会</li>
                <li>· 需完成缴费与身份验证</li>
                <li>· 有效期一年</li>
              </ul>
              <button
                onClick={handleChooseMember}
                className="w-full bg-[#002B49] hover:bg-[#001f35] text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md"
              >
                选择此方式
              </button>
            </div>

            {/* Option B: 非会员 */}
            <div className="border-2 border-[#E5E1DA] rounded-xl p-6 flex flex-col items-center text-center bg-white hover:border-slate-300 transition-colors">
              <h3 className="text-base font-bold text-[#002B49] mb-2">作为非会员继续</h3>
              <p className="text-sm font-bold text-slate-400 mb-1">免费</p>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-5 text-left w-full">
                <li>· 按非会员价参会</li>
                <li>· 无需缴费</li>
                <li>· 可直接绑定分会与报名</li>
              </ul>
              <button
                onClick={handleChooseNonMember}
                className="w-full border-2 border-[#E5E1DA] hover:border-[#002B49] text-slate-600 hover:text-[#002B49] py-2.5 rounded-lg font-bold text-sm transition-all"
              >
                选择此方式
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            选择后可随时在「学会服务 - 会员服务」中变更
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
pnpm check
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MembershipChoiceDialog.tsx
git commit -m "feat: add MembershipChoiceDialog for first-login path selection"
```

---

### Task 4: PartyLayout — 集成首次登录决策弹窗

**Files:**
- Modify: `client/src/components/PartyLayout.tsx`

- [ ] **Step 1: 导入 MembershipChoiceDialog**

在文件顶部 import 区域新增：

```typescript
import MembershipChoiceDialog from "./MembershipChoiceDialog";
```

- [ ] **Step 2: 从 context 获取 userType 和 membershipChoiceMade**

修改 `useMembership()` 的解构（约第15行），新增：

```typescript
  const { currentUser, isLoggedIn, logout, notifications, markNotificationRead, markAllNotificationsRead, societyMembership, userType, membershipChoiceMade } = useMembership();
```

- [ ] **Step 3: 控制弹窗显示逻辑**

在 `PartyLayout` 组件内，现有 state 声明之后（约第18行后），新增状态和逻辑：

```typescript
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);

  // 首次登录且未做选择时，弹出决策对话框
  React.useEffect(() => {
    if (isLoggedIn && !membershipChoiceMade) {
      setShowChoiceDialog(true);
    } else {
      setShowChoiceDialog(false);
    }
  }, [isLoggedIn, membershipChoiceMade]);
```

- [ ] **Step 4: 在 JSX 中渲染弹窗**

在 `return` 的 JSX 最外层 `div` 内（在 `<LoginJoinDialog ... />` 之后），新增：

```tsx
      <MembershipChoiceDialog open={showChoiceDialog} />
```

- [ ] **Step 5: 验证编译**

```bash
pnpm check
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/PartyLayout.tsx
git commit -m "feat: integrate MembershipChoiceDialog on first login"
```

---

### Task 5: Services.tsx — 会议双价展示、会员服务非会员入口

**Files:**
- Modify: `client/src/pages/Services.tsx`

- [ ] **Step 1: 从 context 获取新字段**

在 `useMembership()` 解构中（约第11-40行），新增：

```typescript
    userType,
    membershipChoiceMade,
    chooseMembershipPath,
    getConferenceFee,
```

- [ ] **Step 2: 判断用户身份状态**

在 `renderMemberServices` 函数中，现有的 `isMemberActive` 等判断之后（约第450-456行），新增：

```typescript
    const isNonMember = userType === "non_member";
    const isRegular = userType === "regular";
```

- [ ] **Step 3: 修改会员服务页 — 非会员状态展示**

在"会员主页面"的左侧个人信息卡中，修改会员状态标签（约第708-731行），在现有标签之前新增非会员判断：

```tsx
                  {isNonMember && (
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">非会员</span>
                  )}
                  {isRegular && !membershipChoiceMade && (
                    <span className="inline-block bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">待选择参与方式</span>
                  )}
```

- [ ] **Step 4: 修改会员状态卡 — 尚未入会区域增加非会员展示**

在"学会会员状态卡"中（约第756-766行），修改 `!hasApplied` 分支。在 `!hasApplied` 检查之前，先判断是否为非会员：

在 `!hasApplied` 的代码块（约第756-766行）之前插入非会员分支：

```tsx
              {/* 非会员状态 */}
              {isNonMember && (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person</span>
                  <p className="text-xs text-slate-600 mb-1 font-bold">您当前为非会员</p>
                  <p className="text-xs text-slate-500 mb-4">会议注册费将按非会员标准收取。<br />升级为正式会员可享受优惠价。</p>
                  <button
                    onClick={() => {
                      chooseMembershipPath("member");
                      setShowFeePayment("society");
                      setMemberPayStep(1);
                    }}
                    className="bg-[#002B49] hover:bg-[#001f35] text-white px-6 py-2 rounded font-bold text-xs shadow-md w-full"
                  >
                    升级为正式会员（¥{getMembershipFee("standard")}/年）
                  </button>
                </div>
              )}

              {/* 普通用户（未选择） */}
              {isRegular && !hasApplied && (
                <div className="text-center py-6">
                  ...(existing code stays the same for regular users)...
                </div>
              )}
```

实际代码：将现有的 `!hasApplied` 区块拆分为两个条件。原有 `!hasApplied` 改为 `isRegular && !hasApplied` 和非会员分别处理。会员路径（已申请）的现有区块保持不变。

- [ ] **Step 5: 修改分会绑定区域 — 非会员可绑定**

在分会绑定区域（约第899行），将：

```tsx
              {!isMemberActive && (
```

替换为：

```tsx
              {isRegular && (
```

即只有"未选择的普通用户"才被锁定。非会员和有效会员都可以绑定分会。

- [ ] **Step 6: 修改分会绑定按钮 — 非会员可操作**

在分会绑定按钮区域（约第935-953行），将按钮的 `isMemberActive` 条件改为：

```tsx
                        {(isMemberActive || isNonMember) ? (
```

和：

```tsx
                        ) : (
                          <button disabled ...>需先选择参与方式</button>
                        )}
```

- [ ] **Step 7: 会议卡片 — 仅显示对应身份价格**

在 `renderConferenceServices` 的会议列表部分（约第1568行），修改价格显示行：

将：

```tsx
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-slate-400 text-sm">sell</span> 注册费：<strong>¥ {c.fee} 元</strong></p>
```

替换为：

```tsx
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-slate-400 text-sm">sell</span> 注册费：<strong>¥ {getConferenceFee(c.id)} 元</strong></p>
```

在 `renderConferenceList` 中的同样位置（约第1791行）也做相同替换。

- [ ] **Step 8: 会议通知详情页 — 展示双价**

在会议详情页的"会议缴费说明"区域（约第1359-1361行），修改为：

```tsx
              <h3 className="text-sm font-bold text-[#002B49] border-b border-slate-100 pb-2">二、会议缴费说明</h3>
              <div className="bg-slate-50 border border-[#E5E1DA] rounded-lg p-4 mb-4 text-xs space-y-1">
                <p className="font-bold text-[#002B49] mb-1">收费标准</p>
                <p>正式会员：<strong className="text-[#002B49]">¥ {getConfiguredMemberFee(conf!.id)} 元</strong></p>
                <p>非会员：<strong className="text-red-600">¥ {getConfiguredNonMemberFee(conf!.id)} 元</strong></p>
              </div>
              <p>请各参会代表于大会召开前通过银行线下汇款缴纳会议注册费，并在学会服务门户提交汇款成功凭证截图。初审通过后，即可在线填报详细的学术报告（口头报告/展板交流）题目、上传论文摘要并选择由学会统一代订周边协议酒店。</p>
```

注意：`getConfiguredMemberFee` 和 `getConfiguredNonMemberFee` 需要从 shared/constants 导入。在文件顶部 import 中新增：

```typescript
import { CONFERENCE_STATUS_LABEL, CONFERENCE_STATUS_COLOR, CONFERENCE_FEE_MEMBER, getConferenceFee as getConfiguredConferenceFee } from "@shared/constants";
```

并在组件内定义辅助函数：

```typescript
  const getMemberFeeOnly = (confId: string) => CONFERENCE_FEE_MEMBER[confId] ?? 1000;
  const getNonMemberFeeOnly = (confId: string) => Math.round((CONFERENCE_FEE_MEMBER[confId] ?? 1000) * 1.1);
```

- [ ] **Step 9: 非会员缴费页 — 升级提示**

在会议缴费流程页面的收费明细中（约第1230-1241行），修改会费关联提示。在缴费金额显示处，非会员时增加升级提示：

```tsx
                  {userType === "non_member" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mt-3">
                      提示：升级为正式会员（¥200/年）后，本次会议可节省 ¥{(getNonMemberFeeOnly(confPaymentTarget!) - getMemberFeeOnly(confPaymentTarget!))}。
                    </div>
                  )}
```

- [ ] **Step 10: 非会员报名按钮 — 跳过会员状态检查**

在会议详情页的报名按钮区域（约第1371行），修改 `reg.status === "unpaid"` 分支的检查条件。将 `isLoggedIn` 后的逻辑加入 `userType` 检查：

在 `reg.status === "unpaid"` 的 onClick 中，已有登录检查。在其后新增会员路径检查：

```typescript
                      if (userType === "member" && societyMembership.status !== "active" && societyMembership.status !== "invoice_pending" && societyMembership.status !== "invoice_submitted") {
                        toast.error("您尚未完成会员缴费验证，请先前往会员服务完成入会流程。");
                        return;
                      }
```

- [ ] **Step 11: 验证编译**

```bash
pnpm check
```

- [ ] **Step 12: Commit**

```bash
git add client/src/pages/Services.tsx
git commit -m "feat: dual pricing display, non-member upgrade entry, permission updates"
```

---

### Task 6: PersonalCenter.tsx — 显示用户类型标签

**Files:**
- Modify: `client/src/pages/PersonalCenter.tsx`

- [ ] **Step 1: 从 context 获取 userType**

在 `useMembership()` 解构中（约第40行），新增：

```typescript
  const { currentUser, isLoggedIn, societyMembership, boundBranches, conferenceRegs, userType } = useMembership();
```

- [ ] **Step 2: 修改会员状态标签**

在个人信息卡的头像区域（约第266-289行），修改会员状态标签。在这些标签之前，新增非会员判断：

```tsx
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
```

- [ ] **Step 3: 修改分会Tab的会员锁定提示**

在"我的分会"Tab中（约第419-430行），将会员状态检查改为：

```tsx
            {userType === "regular" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 mt-0.5">lock</span>
                <div>
                  <p className="font-bold">需要先选择参与方式</p>
                  <p className="text-amber-700 mt-1">请先选择成为会员或作为非会员使用，即可绑定专业分会。</p>
                </div>
              </div>
            )}
```

- [ ] **Step 4: 验证编译**

```bash
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/PersonalCenter.tsx
git commit -m "feat: display user type badge in personal center"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
pnpm dev
```

- [ ] **Step 2: 手动验证以下流程**

1. 清除 localStorage → 刷新页面 → 以 `demo@paleontology.org.cn` 登录
2. 验证：登录后立即弹出 MembershipChoiceDialog
3. 点击"作为非会员继续" → 弹窗关闭
4. 前往 学会服务 → 会员服务 → 验证显示"非会员"状态和"升级为正式会员"按钮
5. 绑定一个分会 → 验证可以直接绑定（无需缴费）
6. 前往会议服务 → 查看会议卡片 → 验证只显示非会员价格（会员价 × 1.1）
7. 点击会议详情 → 验证通知页显示双价
8. 报名会议 → 验证不需要会员资格检查
9. 回到会员服务 → 点击"升级为正式会员" → 走缴费流程
10. 模拟审核通过 → 验证会议价格切换为会员价

- [ ] **Step 3: 验证 localStorage 持久化**

退出登录重新登录，验证 userType 选择被保留，不再弹出选择对话框。

- [ ] **Step 4: Commit any fixes if needed**
