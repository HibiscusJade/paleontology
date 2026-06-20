# Phase 6：入会审核 + 退会机制

> **依赖**：Phase 1 完成（需要用户身份模型就位）
> **目标**：会员入会需提交申请书并经管理员审核；会员可申请退会，经审核后解除资格；支持自动退会。

---

## 涉及文件

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/pages/Services.tsx` | Website | 入会申请流程、退会申请入口 |
| `client/src/pages/PersonalCenter.tsx` | Website | 退会申请入口、会员状态展示 |
| `client/src/contexts/MembershipContext.tsx` | Website | 入会/退会状态机、申请书管理 |
| `client/src/pages/admin/MemberManagement.tsx` | Admin | 入会审核列表、退会审核列表 |
| `client/src/pages/admin/AuditWorkbench.tsx` | Admin | 新增入会/退会审核标签页 |
| `client/src/contexts/AdminContext.tsx` | Admin | 入会/退会审核接口、申请书模板管理 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 入会/退会模板上传（复用文件上传逻辑） |

---

## 用户前台修改

### 1. Services.tsx —— 入会申请流程

在「会员服务」标签页中重写入会流程：

```
入会流程（新）：
┌──────────────────────────────────────────────────────┐
│ Step 1: 下载入会申请书模板                              │
│   [下载入会申请书模板.docx]                             │
│                                                      │
│ Step 2: 填写并上传入会申请书                             │
│   [上传入会申请书] ← 必填，.doc/.docx/.pdf               │
│   （管理员上传的模板由后台维护）                          │
│                                                      │
│ Step 3: 等待管理员审核                                  │
│   状态：审核中...                                       │
│                                                      │
│ Step 4: 审核通过 → 缴纳会员费                            │
│   （进入现有的缴费流程）                                 │
│                                                      │
│ Step 5: 缴费审核通过 → 成为正式会员                       │
└──────────────────────────────────────────────────────┘
```

### 2. PersonalCenter.tsx —— 退会申请入口

在「个人信息」标签页中新增退会区域：

```
会员状态：有效会员（有效期至 2027-06-20）
[申请退会]

点击后弹出退会流程：
┌──────────────────────────────────────┐
│ 退会申请                              │
│                                      │
│ Step 1: 下载退会申请书模板             │
│   [下载退会申请书模板.docx]            │
│                                      │
│ Step 2: 填写并上传退会申请书            │
│   [上传退会申请书] ← 必填              │
│                                      │
│ Step 3: 提交申请                      │
│   [确认提交退会申请]                   │
│                                      │
│ ⚠️ 退会后：                          │
│ · 当前学会会员资格即时终止             │
│ · 已缴费的待参会订单保留，正常参会      │
│ · 可继续以非会员身份参加其他会议        │
│ · 历史参会记录完整保留                 │
└──────────────────────────────────────┘
```

### 3. MembershipContext.tsx —— 入会/退会状态机

```ts
// 会员状态扩展（在 Phase 0 基础上）
type MembershipStatus = 
  | "not_member"              // 未入会
  | "application_submitted"   // 入会申请书已提交，待审核
  | "application_rejected"    // 入会申请被驳回（可重新提交）
  | "application_approved"    // 入会申请通过，待缴费
  | "voucher_submitted"       // 凭证已提交（同现有）
  | "voucher_rejected"        // 凭证被驳回（同现有）
  | "invoice_pending"         // 待上传发票（同现有）
  | "invoice_overdue"         // 发票逾期（同现有）
  | "invoice_submitted"       // 发票已提交（同现有）
  | "invoice_rejected"        // 发票被驳回（同现有）
  | "active"                  // 会员有效（同现有）
  | "withdrawal_submitted"    // 退会申请已提交，待审核
  | "withdrawal_rejected"     // 退会申请被驳回
  | "withdrawn"               // 已退会
  | "expired"                 // 已过期（同现有）

// 新增操作
submitMembershipApplication(applicationFile: File): void;
cancelMembershipApplication(): void;
submitWithdrawalApplication(applicationFile: File): void;
cancelWithdrawalApplication(): void;

// 入会申请书模板
getMembershipApplicationTemplate(): string; // 返回模板下载 URL
getWithdrawalApplicationTemplate(): string; // 返回模板下载 URL
```

---

## 管理后台修改

### 4. AuditWorkbench.tsx —— 新增审核标签页

当前有两个标签页：凭证初审 + 发票终审

新增两个标签页：
- **入会申请审核**：待审核入会申请书列表
  - 表格：申请人 / 邮箱 / 申请时间 / 申请书下载 / 操作（通过/驳回）
  - 通过 → 用户进入缴费阶段
  - 驳回 → 填写驳回原因，用户可重新提交
- **退会申请审核**：待审核退会申请书列表
  - 表格：申请人 / 邮箱 / 会员状态 / 有效期 / 申请时间 / 申请书下载 / 操作（通过/驳回）
  - 通过 → 用户会员资格即时终止，状态变为 `withdrawn`
  - 驳回 → 填写驳回原因

### 5. MemberManagement.tsx —— 会员列表更新

- 新增入会申请书审核状态列
- 新增退会状态筛选
- 支持查看/下载用户提交的入会/退会申请书

### 6. AdminContext.tsx —— 审核接口

```ts
// 入会申请审核
getPendingMembershipApplications(): MembershipApplication[];
approveMembershipApplication(userEmail: string): void;
rejectMembershipApplication(userEmail: string, reason: string): void;

// 退会申请审核
getPendingWithdrawalApplications(): WithdrawalApplication[];
approveWithdrawalApplication(userEmail: string): void;
rejectWithdrawalApplication(userEmail: string, reason: string): void;

// 模板管理
setMembershipApplicationTemplate(file: File): void;
setWithdrawalApplicationTemplate(file: File): void;
getMembershipApplicationTemplateUrl(): string;
getWithdrawalApplicationTemplateUrl(): string;

// 自动退会（定时检查）
checkMembershipExpiry(): void; // 检查所有会员，过期自动标记为 expired
```

### 7. ConferenceManagement.tsx —— 模板上传（复用）

- 会议编辑表单中新增两个模板上传入口（可放在「资料管理」区域）：
  - 入会申请书模板上传
  - 退会申请书模板上传
- 复用 Phase 2 中的文件上传逻辑

---

## 验收标准

- [ ] 用户前台：入会申请需强制上传入会申请书
- [ ] 用户前台：提供入会申请书模板下载
- [ ] 用户前台：审核通过 → 缴费 → 成为正式会员（完整流程）
- [ ] 用户前台：退会申请需强制上传退会申请书
- [ ] 用户前台：提供退会申请书模板下载
- [ ] 用户前台：退会审核通过后会员资格即时终止
- [ ] 用户前台：退会后历史缴费/参会记录完整保留
- [ ] 用户前台：退会后可以非会员身份继续参加会议
- [ ] 管理后台：入会申请书审核列表可查看、下载、通过/驳回
- [ ] 管理后台：退会申请书审核列表可查看、下载、通过/驳回
- [ ] 管理后台：可上传/更新入会和退会申请书模板
- [ ] 管理后台：过期会员自动标记为 expired
- [ ] TypeScript 类型检查通过
- [ ] 构建通过
