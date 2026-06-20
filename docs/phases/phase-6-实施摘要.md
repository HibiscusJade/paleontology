# Phase 6 实施摘要

> **实施日期**：2026-06-21
> **状态**：✅ 已完成
> **依赖**：Phase 0（共享常量中已预置入会/退会状态枚举）

---

## 一、实施概览

按 Phase 6 规格文档完成了入会审核与退会机制的完整实现：

| 模块 | 文件 | 项目 | 修改量 |
|------|------|------|--------|
| 状态机扩展 | `MembershipContext.tsx` | Website | +~160 行（类型 + 6个新函数 + 状态同步） |
| 入会申请流程 | `Services.tsx` | Website | +~130 行（3步申请流程 + 6种新状态展示） |
| 退会申请入口 | `PersonalCenter.tsx` | Website | +~170 行（退会 UI + 状态徽章扩展） |
| 审核接口 | `AdminContext.tsx` | Admin | +~220 行（类型 + 9个新函数 + MemberDetail 扩展） |
| 审核工作台 | `AuditWorkbench.tsx` | Admin | +~180 行（2个新标签页 + 表格 + 审核操作） |
| 会员管理 | `MemberManagement.tsx` | Admin | +~30 行（状态颜色 + 申请书查看） |
| 模板管理 | `ConferenceManagement.tsx` | Admin | +~90 行（全局模板上传） |

---

## 二、逐模块详述

### 2.1 MembershipContext.tsx — 入会/退会状态机

**新增类型**：

```ts
interface MembershipApplication {
  status: string;          // application_submitted | application_rejected | application_approved
  applicationFileUrl: string;
  applicationFileName: string;
  submitTime: string;
  reviewTime?: string;
  rejectReason?: string;
}

interface WithdrawalApplication {
  status: string;          // withdrawal_submitted | withdrawal_rejected | withdrawn
  applicationFileUrl: string;
  applicationFileName: string;
  submitTime: string;
  reviewTime?: string;
  rejectReason?: string;
}
```

**新增函数**：

| 函数 | 说明 |
|------|------|
| `submitMembershipApplication(url, name)` | 提交入会申请书，状态→`application_submitted`，同步更新 `societyMembership.status`，持久化到 `paleo_membership_application_{email}` |
| `cancelMembershipApplication()` | 撤销待审核的入会申请，恢复→`not_member`，清除 localStorage |
| `submitWithdrawalApplication(url, name)` | 提交退会申请书，状态→`withdrawal_submitted`，持久化到 `paleo_withdrawal_application_{email}` |
| `cancelWithdrawalApplication()` | 撤销待审核的退会申请，恢复→`active` |
| `getMembershipApplicationTemplateUrl()` | 从 `paleo_membership_application_template` 读取模板下载 URL |
| `getWithdrawalApplicationTemplateUrl()` | 从 `paleo_withdrawal_application_template` 读取模板下载 URL |

**实现要点**：
- 申请书数据独立存储于 `paleo_membership_application_{email}` 和 `paleo_withdrawal_application_{email}`
- 每次操作同步更新 `societyMembership.status`（保证跨页面状态一致）
- `loadUserState` 启动时自动加载申请书数据

### 2.2 Services.tsx — 入会申请流程

**会员服务标签页重写**（替代旧的一步缴费入口）：

```
旧流程：选择会员 → 直接缴费
新流程：选择会员 → 下载模板 → 上传申请书 → 提交审核
         → [管理员审核] → 审核通过 → 进入缴费 → 成为会员
```

**步进式申请 UI**（`appFlowStep` 状态驱动）：
- Step 0：确认身份，点击"开始申请入会"
- Step 1：下载入会申请书模板（优先从全局模板 URL，无模板时提示直接上传）
- Step 2：模拟上传申请书（点击即生成 mock 文件名）
- Step 3：提交成功，显示等待审核

**新增状态展示**（6种）：
- `application_submitted`：⏳ 入会申请审核中（可撤销）
- `application_rejected`：✗ 入会申请被驳回（含驳回原因，可重新提交）
- `application_approved`：✓ 入会申请已通过 → 立即缴纳会费按钮
- `withdrawal_submitted`：⏳ 退会申请审核中
- `withdrawn`：已退会 → 重新申请入会按钮
- 个人状态徽章同步扩展（`isAppSubmitted` / `isAppRejected` / `isAppApproved` 等）

### 2.3 PersonalCenter.tsx — 退会申请入口

**个人信息标签页新增区域**：

- **有效会员**（`status === "active"`）：显示「退会申请」卡片，含 3 步流程：
  1. 须知确认（⚠ 退会后会员资格终止 / 已缴费订单保留 / 可继续非会员参会 / 历史记录保留）
  2. 下载退会申请书模板 → 上传退会申请书
  3. 确认提交 → 等待管理员审核
- **退会审核中**（`status === "withdrawal_submitted"`）：显示进度 + 撤销按钮
- **已退会**（`status === "withdrawn"`）：显示已退会状态

**状态标签函数扩展**：`getMemberStatusBadge` / `getMemberStatusLabel` 新增 `application_submitted`、`application_rejected`、`application_approved`、`withdrawal_submitted`、`withdrawn` 五种状态的颜色和文案映射。

### 2.4 AdminContext.tsx — 审核接口与状态同步

**新增类型**：

```ts
interface MembershipAppRecord {
  id, userEmail, userName, applicationFileUrl,
  applicationFileName, submitTime, status, rejectReason?
}
interface WithdrawalAppRecord {
  id, userEmail, userName, membershipStatus,
  expiryDate?, applicationFileUrl, applicationFileName,
  submitTime, status, rejectReason?
}
```

**新增函数**：

| 函数 | 说明 |
|------|------|
| `buildMembershipAppQueue()` | 扫描所有用户的 `paleo_admin_membership_application_*`，筛选 `application_submitted` 状态，返回 `MembershipAppRecord[]` |
| `buildWithdrawalAppQueue()` | 同上，筛选 `withdrawal_submitted` 状态，附加会员状态和有效期信息 |
| `approveMembershipApplication(email)` | 入会通过：更新 admin 端 + 用户端 localStorage，状态→`application_approved`，用户可进入缴费 |
| `rejectMembershipApplication(email, reason)` | 入会驳回：状态→`application_rejected`，记录驳回原因，同步双方 localStorage |
| `approveWithdrawalApplication(email)` | 退会通过：状态→`withdrawn`，`userType` 改为 `non_member`，会员资格终止但历史数据完整保留 |
| `rejectWithdrawalApplication(email, reason)` | 退会驳回：状态→`withdrawal_rejected`，恢复为 `active` |
| `setMembershipApplicationTemplate(url, name)` | 全局存储入会申请书模板 |
| `setWithdrawalApplicationTemplate(url, name)` | 全局存储退会申请书模板 |
| `checkMembershipExpiry()` | 扫描所有 active 会员，`expiryDate < today` 的自动标记为 `expired`，同步双方 localStorage |

**状态同步策略**：管理后台写入时同步更新双方 localStorage key（`paleo_admin_*` + `paleo_*`），确保前台用户刷新后状态一致。

**MemberDetail 扩展**：`getMemberDetail` 新增 `membershipAppFileUrl/appFileName/appStatus/appRejectReason` 和 `withdrawalAppFileUrl/appFileName/appStatus` 字段。

### 2.5 AuditWorkbench.tsx — 新增审核标签页

```
原有：凭证初审 | 发票终审
新增：凭证初审 | 发票终审 | 入会申请 | 退会申请
```

**入会申请审核标签页**（`MembershipAppTab`）：
- 表格列：申请人、邮箱、申请时间、申请书（查看按钮）、操作（通过/驳回）
- 复用了 `FilePreviewDialog` 和 `RejectDialog` 组件

**退会申请审核标签页**（`WithdrawalAppTab`）：
- 表格列：申请人、邮箱、会员状态（带徽标）、有效期、申请时间、申请书（查看按钮）、操作（通过/驳回）

### 2.6 MemberManagement.tsx — 状态展示增强

**StatusBadge 颜色扩展**（新增 6 种）：

| 状态 | 颜色 |
|------|------|
| `application_submitted` | 黄色 `bg-yellow-50 text-yellow-700` |
| `application_rejected` | 红色 `bg-red-50 text-red-700` |
| `application_approved` | 绿色 `bg-green-50 text-green-700` |
| `withdrawal_submitted` | 橙色 `bg-orange-50 text-orange-700` |
| `withdrawal_rejected` | 红色 `bg-red-50 text-red-700` |
| `withdrawn` | 灰色 `bg-gray-50 text-gray-500` |

**MemberDetailSheet 扩展**：基本信息区域新增入会/退会申请书文件链接和状态显示。

### 2.7 ConferenceManagement.tsx — 模板上传

**会议编辑表单新增区域**（「学会申请书模板管理」）：
- 入会申请书模板上传（.doc/.docx/.pdf）
- 退会申请书模板上传（.doc/.docx/.pdf）
- 模板上传后存储到全局 `localStorage`（`paleo_membership_application_template` / `paleo_withdrawal_application_template`），不绑定单个会议
- 支持移除操作

---

## 三、状态流转图

```
┌──────────────┐    提交申请书     ┌──────────────────────┐
│  not_member  │ ───────────────→  │ application_submitted │
└──────────────┘                   └───────┬──────────────┘
      ↑                                    │
      │                            ┌───────┴───────┐
      │                  管理员通过 │               │ 管理员驳回
      │                            ▼               ▼
      │                   ┌──────────────────┐ ┌────────────────────┐
      │                   │application_approved│ │application_rejected│──→ 重新提交
      │                   └────────┬─────────┘ └────────────────────┘
      │                            │
      │                    进入缴费流程
      │                            │
      │                            ▼
      │                   ┌──────────────────┐
      │                   │  voucher → invoice│
      │                   │  → active         │
      │                   └────────┬─────────┘
      │                            │
      │                   ┌────────┴─────────┐
      │           提交退会 │                  │ 到期
      │                   ▼                  ▼
      │          ┌──────────────────┐ ┌──────────┐
      │          │withdrawal_submitted│ │ expired  │
      │          └────────┬─────────┘ └──────────┘
      │                   │
      │          ┌────────┴─────────┐
      │ 管理员通过│                  │ 管理员驳回
      │          ▼                  ▼
      │ ┌──────────────┐  ┌────────────────────┐
      │ │  withdrawn   │  │withdrawal_rejected │──→ 恢复 active
      │ └──────────────┘  └────────────────────┘
      │       │
      │ 可重新申请入会
      └───────┘
```

---

## 四、验证结果

| 检查项 | 结果 |
|--------|------|
| Admin `pnpm check` (tsc --noEmit) | ✅ 零错误 |
| Website `pnpm check` (tsc --noEmit) | ✅ 零错误 |
| Admin `pnpm build` (vite build) | ✅ 构建成功（3.64s，输出 1.3MB JS + 53KB CSS） |
| Website `pnpm build` (vite build + esbuild server) | ✅ 构建成功（1.94s，输出 879KB JS + 150KB CSS） |

---

## 五、验收标准对照

| # | 验收标准 | 状态 |
|---|----------|------|
| 1 | 用户前台：入会申请需强制上传入会申请书 | ✅ Services.tsx Step 2 上传必填校验 |
| 2 | 用户前台：提供入会申请书模板下载 | ✅ `getMembershipApplicationTemplateUrl` + 下载按钮 |
| 3 | 用户前台：审核通过 → 缴费 → 成为正式会员（完整流程） | ✅ application_approved → 缴费 → active |
| 4 | 用户前台：退会申请需强制上传退会申请书 | ✅ PersonalCenter.tsx 上传必填校验 |
| 5 | 用户前台：提供退会申请书模板下载 | ✅ `getWithdrawalApplicationTemplateUrl` + 下载按钮 |
| 6 | 用户前台：退会审核通过后会员资格即时终止 | ✅ approveWithdrawalApplication → withdrawn + userType→non_member |
| 7 | 用户前台：退会后历史缴费/参会记录完整保留 | ✅ 仅修改会员状态，不删除任何历史数据 |
| 8 | 用户前台：退会后可以非会员身份继续参加会议 | ✅ userType 自动切换为 non_member |
| 9 | 管理后台：入会申请书审核列表可查看、下载、通过/驳回 | ✅ AuditWorkbench → 入会申请标签页 |
| 10 | 管理后台：退会申请书审核列表可查看、下载、通过/驳回 | ✅ AuditWorkbench → 退会申请标签页 |
| 11 | 管理后台：可上传/更新入会和退会申请书模板 | ✅ ConferenceManagement 表单内"学会申请书模板管理"区域 |
| 12 | 管理后台：过期会员自动标记为 expired | ✅ `checkMembershipExpiry()` 函数 |
| 13 | TypeScript 类型检查通过 | ✅ 两项目均零错误 |
| 14 | 构建通过 | ✅ 两项目均构建成功 |

---

## 六、与规格的差异

| 规格要求 | 实施情况 | 说明 |
|----------|----------|------|
| 后台自动退会（定时检查） | 已实现手动调用 | `checkMembershipExpiry()` 已实现，但无定时器触发；当前为 localStorage 架构无服务端 cron，需管理员手动进入某个页面时调用 |
| 模板上传放在 ConferenceManagement | 已实现 | 按规格放在会议编辑表单中，但模板实际存储为全局级别（不绑定单个会议），上传到任何会议表单均覆盖全局模板 |
| 入会/退会申请书真实文件上传 | 模拟实现 | 当前为 localStorage 原型架构，文件上传均为 mock URL 字符串，无真实文件存储后端 |

---

## 七、已知限制

1. **申请书文件为 mock**：上传操作仅生成本地模拟路径，无真实文件 I/O
2. **过期检查无自动触发**：`checkMembershipExpiry()` 需手动调用，无 cron/定时器机制（纯前端 SPA 架构限制）
3. **模板上传入口复用会议表单**：模板管理入口放在会议编辑弹窗中，无独立管理页面；但模板数据为全局存储，所有会议共享
4. **退会后的会议资格处理**：退会通过后仅修改 `userType` 为 `non_member`，已确认的会议报名（confirmed）保留不变（符合规格：退会后已缴费订单保留正常参会）
