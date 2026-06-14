# 中国古生物学会 — 后台管理系统设计规范

> **日期：** 2026-06-14
> **版本：** V1.0
> **用途：** 定义后台管理系统（PaleontologicalResearchAdminFront）的架构、页面、角色权限和交互流程

---

## 目录

1. [项目概述](#1-项目概述)
2. [架构设计](#2-架构设计)
3. [角色权限模型](#3-角色权限模型)
4. [路由与菜单](#4-路由与菜单)
5. [页面设计](#5-页面设计)
6. [数据流（原型阶段）](#6-数据流原型阶段)
7. [UI设计规范](#7-ui设计规范)
8. [项目结构](#8-项目结构)
9. [实施分期](#9-实施分期)
10. [附录](#10-附录)

---

## 1. 项目概述

### 1.1 背景

中国古生物学会网站需要一套后台管理系统，供学会总管理员、分会管理员和财务审核员三类角色使用。所有角色共用同一后台入口，登录后根据权限展示不同菜单和数据。

### 1.2 部署方式

**独立项目**（方案B），位于 `D:\Paleontology\paleontology-admin-latest\`，与主项目 `paleontology-website-latest` 独立构建部署。

### 1.3 代码复用策略

采用**拷贝+适配**方式：从主项目拷贝以下文件，各项目独立维护：
- `shared/constants.ts` — 会员费配置、状态枚举、分会ID映射
- `shared/const.ts` — 常量
- `client/src/index.css` — 设计令牌（CSS变量、Tailwind自定义类）
- `client/src/components/ui/` — shadcn/ui 组件库（59个组件，按需拷贝）
- `client/src/lib/utils.ts` — `cn()` 工具函数

### 1.4 MVP范围

**本期实现：**
- 登录与角色权限
- 首页仪表盘（按角色差异化）
- 审核工作台（凭证初审 + 发票终审 + 批量操作）
- 会员管理（查询、详情、禁用/启用）
- 会议管理（发布/编辑/价格配置）
- 数据统计面板
- 财务记录查询
- 分会管理

**延后：**
- CMS内容管理（11个一级栏目）
- 系统配置（邮件模板等）
- 操作日志/审计

---

## 2. 架构设计

### 2.1 技术栈

与主项目保持一致：

| 技术 | 版本/方案 |
|------|----------|
| 前端框架 | React 19 |
| 构建工具 | Vite 7 |
| 类型系统 | TypeScript 5.6 |
| CSS框架 | Tailwind CSS 4 |
| UI组件库 | shadcn/ui (New York style) |
| 路由 | wouter |
| 状态管理 | React Context (`AdminContext`) |
| 图标 | lucide-react |
| 表单 | react-hook-form + zod |
| 图表 | recharts |
| 动画 | framer-motion |
| 通知 | sonner |

### 2.2 组件层级

```
App
├── ThemeProvider (强制light模式)
│   └── AdminProvider (管理员认证+角色+数据)
│       └── TooltipProvider
│           └── Toaster (sonner)
│               └── Router
│                   ├── /admin/login → LoginPage
│                   └── /admin/* → AdminLayout (受保护路由)
│                       ├── AdminTopBar (顶栏)
│                       ├── AdminSidebar (侧边栏，按角色过滤)
│                       └── 内容区 {children}
```

### 2.3 受保护路由逻辑

```
访问 /admin/* 
  → 检查 AdminContext.isAdminLoggedIn
  → 未登录 → 重定向到 /admin/login
  → 已登录 → 检查路由权限
    → 无权限 → 重定向到 /admin/dashboard + toast提示
    → 有权限 → 渲染页面
```

---

## 3. 角色权限模型

### 3.1 三级角色定义

```
┌──────────────┬──────────────┬────────────────────────────────────────────────────────────┐
│     角色     │   管理范围   │                          主要能力                          │
├──────────────┼──────────────┼────────────────────────────────────────────────────────────┤
│ 学会总管理员 │ 全站全部数据 │ 内容管理、会员管理、会议管理、统计导出、系统配置、分会管理 │
├──────────────┼──────────────┼────────────────────────────────────────────────────────────┤
│ 分会管理员   │ 自己所属分会 │ 发布本分会会议、查看本分会数据统计                         │
├──────────────┼──────────────┼────────────────────────────────────────────────────────────┤
│ 财务审核员   │ 缴费相关     │ 凭证初审、发票终审、驳回/通过、查看缴费记录                │
└──────────────┴──────────────┴────────────────────────────────────────────────────────────┘
```

### 3.2 权限矩阵

| 页面/功能 | 总管理员 | 分会管理员 | 财务审核员 |
|-----------|:------:|:------:|:------:|
| 首页仪表盘 | ✅ 全站 | ✅ 本分会 | ✅ 审核统计 |
| 审核工作台 | ✅ | ❌ | ✅ |
| 会员管理 | ✅ | ❌ | ❌ |
| 会议管理 | ✅ 全部 | ✅ 本分会 | ❌ |
| 数据统计 | ✅ | ✅ 本分会 | ❌ |
| 财务记录 | ✅ | ❌ | ✅ (只读) |
| 分会管理 | ✅ | ❌ | ❌ |

### 3.3 侧边栏菜单（按角色）

**学会总管理员：**
- 🏠 首页仪表盘
- 📋 审核工作台
- 👥 会员管理
- 📅 会议管理
- 📊 数据统计
- 💰 财务记录
- 🏛️ 分会管理

**分会管理员：**
- 🏠 首页仪表盘
- 📅 会议管理
- 📊 数据统计

**财务审核员：**
- 🏠 首页仪表盘
- 📋 审核工作台
- 💰 财务记录

### 3.4 内置管理员账号（原型阶段）

| 邮箱 | 密码 | 角色 | 所属分会 |
|------|------|------|---------|
| `admin@paleontology.org.cn` | `admin123` | 学会总管理员 | — |
| `branch@gjzdw.org.cn` | `admin123` | 分会管理员 | 古脊椎动物学分会 (gjzdw) |
| `finance@paleontology.org.cn` | `admin123` | 财务审核员 | — |

---

## 4. 路由与菜单

### 4.1 路由表

| 路由 | 页面组件 | 权限 |
|------|---------|------|
| `/admin/login` | `LoginPage` | 公开（未登录时） |
| `/admin/dashboard` | `Dashboard` | 所有角色 |
| `/admin/audit` | `AuditWorkbench` | 总管理员、财务审核员 |
| `/admin/members` | `MemberManagement` | 总管理员 |
| `/admin/conferences` | `ConferenceManagement` | 总管理员、分会管理员 |
| `/admin/statistics` | `Statistics` | 总管理员、分会管理员 |
| `/admin/finance` | `FinanceRecords` | 总管理员、财务审核员 |
| `/admin/branches` | `BranchManagement` | 总管理员 |
| `*` | `NotFound` | — |

### 4.2 路由→菜单图标映射

| 路由 | 中文名 | lucide-react 图标 |
|------|--------|-------------------|
| `/admin/dashboard` | 首页仪表盘 | `LayoutDashboard` |
| `/admin/audit` | 审核工作台 | `ClipboardCheck` |
| `/admin/members` | 会员管理 | `Users` |
| `/admin/conferences` | 会议管理 | `Calendar` |
| `/admin/statistics` | 数据统计 | `BarChart3` |
| `/admin/finance` | 财务记录 | `Receipt` |
| `/admin/branches` | 分会管理 | `Building2` |

---

## 5. 页面设计

### 5.1 登录页 (`/admin/login`)

- 居中卡片布局，深蓝背景
- Logo + "中国古生物学会 · 管理后台"
- 邮箱 + 密码表单
- 无注册入口（管理员账号由系统预设）
- 登录失败：toast 提示 "账号或密码错误"
- 登录成功：跳转至 `/admin/dashboard`

### 5.2 AdminLayout（后台布局外壳）

```
┌─────────────────────────────────────────────────────────┐
│ TopBar (h-14, bg-strata-blue-deep)                       │
│ [Logo 中国古生物学会·管理后台]  ⋯⋯⋯⋯  [铃铛🔔] [头像▼] │
├────────────┬────────────────────────────────────────────┤
│ Sidebar    │                                            │
│ (w-56)     │         内容区 (flex-1, overflow-y-auto)    │
│            │                                            │
│ 导航菜单    │         {children}                         │
│ (按角色)   │                                            │
│            │                                            │
│ 底部:       │                                            │
│ 当前角色    │                                            │
│ 安全退出    │                                            │
└────────────┴────────────────────────────────────────────┘
```

**顶栏元素：**
- 左侧：Logo + "管理后台"
- 右侧：通知铃铛（红点徽章）+ 管理员头像 + 角色标签 + 下拉菜单（安全退出）

**侧边栏元素：**
- 顶部：管理员信息卡（头像、姓名、角色标签）
- 中间：导航菜单（按角色过滤）
- 底部：安全退出按钮

**侧边栏菜单项状态：**
- 默认：深蓝背景白色文字
- 激活：金色左边框 + 浅蓝背景 `bg-strata-blue-deep/10`
- hover：浅蓝背景

### 5.3 首页仪表盘 (`/admin/dashboard`)

**总管理员视角：**
- 统计卡片行（4个）：会员总数 / 活跃会员 / 待审核数 / 进行中会议
- 最近审核记录列表（最新5条）
- 各分会绑定人数柱状图（recharts BarChart）
- 缴费趋势折线图

**分会管理员视角：**
- 统计卡片行（3个）：本分会会议数 / 本分会报名人数 / 待审核数
- 本分会会议报名列表
- 本分会绑定人数

**财务审核员视角：**
- 统计卡片行（4个）：待初审 / 待终审 / 今日处理 / 逾期未上传
- 两阶段审核通过率（饼图）
- 最近审核记录

### 5.4 审核工作台 (`/admin/audit`)

**页面结构：**
- 两个 Tab：初审队列 / 终审队列（shadcn Tabs组件）
- 每个 Tab 顶部：统计摘要行 + 操作栏（全选、批量通过、批量驳回）
- 表格：复选框 | 邮箱 | 姓名 | 类型(会员费/会议费) | 金额 | 提交时间 | 文件预览 | 状态 | 操作

**初审队列每条记录：**
- 凭证缩略图可点击放大预览（shadcn Dialog）
- OCR提取金额显示
- 操作：[通过] [驳回]

**终审队列每条记录：**
- 发票缩略图可点击放大预览
- 凭证对照（左右对比）
- OCR金额比对结果（一致/不一致，标绿/标红）
- 操作：[通过] [驳回] [延期]

**驳回交互：**
- 点击驳回 → 弹出 Dialog，必填驳回原因（Textarea）
- 确认后更新状态 + toast提示

**手动延期：**
- 仅"待上传发票"/"发票逾期"状态可操作
- 弹出 Dialog：选择新截止日期 + 填写延期理由

**批量操作：**
- 支持全选 / 多选
- 批量通过：一次确认后全部通过
- 批量驳回：填写统一驳回原因

### 5.5 会员管理 (`/admin/members`)

**搜索筛选栏：**
- 搜索框（邮箱/姓名模糊搜索）
- 会员状态下拉筛选（9种状态）
- 分会上拉筛选

**会员列表表格：**
- 列：邮箱 | 姓名 | 单位 | 会员状态标签 | 绑定分会 | 有效期 | 操作
- 状态标签使用前台相同的9色标签系统
- 分页

**操作列：**
- [查看详情] → 侧边抽屉（shadcn Sheet）展示完整信息+缴费记录
- [禁用/启用] → 二次确认弹窗
- [手动开通] → 仅"尚未入会"/"已过期"状态可操作

### 5.6 会议管理 (`/admin/conferences`)

**会议列表：**
- 总管理员看到全部会议；分会管理员仅看到本分会会议
- 卡片网格布局（每条会议一张卡片）
- 每张卡片：会议名称、所属分会、状态标签、报名人数、操作按钮
- [新建会议] 按钮（顶栏）

**新建/编辑会议表单（Dialog或独立页）：**
- 基本信息：会议名称、所属分会、会议时间、地点
- 费用配置：会员价、非会员价（自动计算 = 会员价×1.1，可手动覆盖）
- 截止日期：缴费截止日、摘要修改截止日
- 分会场配置：动态添加/删除分会场选项
- 附件上传：通知PDF、摘要模板
- 会议状态：草稿/发布

### 5.7 数据统计 (`/admin/statistics`)

**总管理员视角：**
- 会员费统计：当年已缴人数/金额/笔数、累计数据
- 分会绑定统计：各分会绑定人数柱状图、绑定分布饼图
- 会议费统计：按分会+会议维度表格
- 两阶段审核统计：通过率、平均审核时长、逾期恢复率

**分会管理员视角（仅本分会数据）：**
- 本分会会议报名统计
- 本分会绑定人数趋势

**导出按钮：** 各统计区块有"导出Excel"按钮（原型阶段模拟）

### 5.8 财务记录 (`/admin/finance`)

**筛选栏：**
- 类型：会员费/会议费
- 状态：凭证初审中/待上传发票/发票终审中/已确认/已驳回/逾期
- 日期范围

**缴费记录表格：**
- 列：记录编号 | 用户 | 类型 | 金额 | 状态 | 凭证提交时间 | 发票提交时间 | 审核时间 | 操作
- 操作：[查看详情]（展示完整审核轨迹+文件）
- 手动延期入口

### 5.9 分会管理 (`/admin/branches`)

**分会列表：**
- 11个分会卡片
- 每张卡片：Logo、名称、简介、绑定人数、禁用/启用状态

**编辑功能：**
- 编辑分会信息（名称、简介、Logo上传）
- 禁用/启用分会
- 分配分会管理员（设置分会管理员邮箱）

---

## 6. 数据流（原型阶段）

### 6.1 数据存储

沿用主项目的 localStorage 模式，键名前缀 `paleo_admin_`：

| Key | 内容 |
|-----|------|
| `paleo_admin_current_user` | 当前登录管理员的邮箱 |
| `paleo_admin_db` | 内置管理员列表（JSON） |
| `paleo_user_db` | 共享主项目用户数据（读主项目的key） |
| `paleo_society_membership_{email}` | 会员状态（读写） |
| `paleo_conference_regs_{email}` | 会议注册状态（读写） |
| `paleo_conferences_db` | 会议配置数据（后台管理的新key） |
| `paleo_branches_db` | 分会配置数据 |
| `paleo_audit_log` | 审核操作记录 |

### 6.2 AdminContext 接口

```typescript
interface AdminContextType {
  // 认证
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  adminLogin(email: string, password: string): boolean;
  adminLogout(): void;

  // 角色
  adminRole: "super_admin" | "branch_admin" | "finance_reviewer";
  adminBranchId: string | null;  // 分会管理员所属分会

  // 权限
  canAccess(path: string): boolean;
  getAllowedMenuItems(): MenuItem[];

  // 审核
  pendingVoucherReviews: ReviewItem[];   // 初审队列
  pendingInvoiceReviews: ReviewItem[];   // 终审队列
  approveVoucher(targetId: string): void;
  rejectVoucher(targetId: string, reason: string): void;
  approveInvoice(targetId: string): void;
  rejectInvoice(targetId: string, reason: string): void;
  batchApproveVoucher(ids: string[]): void;
  batchRejectVoucher(ids: string[], reason: string): void;
  batchApproveInvoice(ids: string[]): void;
  batchRejectInvoice(ids: string[], reason: string): void;
  extendDeadline(targetId: string, newDeadline: string, reason: string): void;

  // 会员管理
  getAllMembers(filters?: MemberFilter): MemberRecord[];
  getMemberDetail(email: string): MemberDetail | null;
  toggleMemberDisabled(email: string): void;
  manualActivateMember(email: string): void;

  // 会议管理
  getAllConferences(): ConferenceRecord[];
  getBranchConferences(branchId: string): ConferenceRecord[];
  createConference(data: ConferenceData): void;
  updateConference(id: string, data: ConferenceData): void;

  // 统计
  getDashboardStats(): DashboardStats;
  getBranchDashboardStats(branchId: string): BranchDashboardStats;
  getFinanceDashboardStats(): FinanceDashboardStats;

  // 分会管理
  getAllBranches(): BranchRecord[];
  updateBranch(id: string, data: BranchData): void;
  toggleBranchDisabled(id: string): void;

  // 通知
  notifications: AdminNotification[];
  addNotification(n: Omit<AdminNotification, 'id' | 'time' | 'read'>): void;
  markAllRead(): void;
}
```

### 6.3 审核流程数据联动

后台审核操作直接影响主项目共享的 localStorage 数据：

```
财务审核员点击"初审通过"
  → AdminContext.approveVoucher(userEmail)
  → 读取 paleo_society_membership_{email}
  → 更新 status: voucher_submitted → invoice_pending
  → 设置 invoiceDeadline（今天+7工作日）
  → 写回 localStorage
  → addNotification（审核通过通知）
  → toast "初审已通过"

用户在前台刷新 → MembershipContext 读取 localStorage
  → 状态自动更新为 invoice_pending
```

---

## 7. UI设计规范

### 7.1 色彩体系

沿袭主项目 "Strata & Heritage" 设计系统：

| Token | 色值 | Tailwind类 | 语义 |
|-------|------|-----------|------|
| 地层深蓝 | `#002B49` | 顶栏、侧边栏背景、主标题 |
| 党建红 | `#C41E3A` | 强调色、驳回按钮 |
| 古生物金 | `#D9C5A0` | Logo高亮、侧边栏激活边框 |
| 宣纸白 | `#FCFAF7` | 内容区背景 |
| 化石石 | `#E5E1DA` | 卡片边框、分割线 |

### 7.2 状态标签（与前台一致）

| 状态 | 样式 |
|------|------|
| 未缴费/尚未入会 | `bg-gray-50 text-gray-500 border-gray-200` |
| 凭证初审中 | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| 凭证被驳回 | `bg-red-50 text-red-700 border-red-200` |
| 待上传发票 | `bg-blue-50 text-blue-700 border-blue-200` |
| 发票逾期 | `bg-orange-50 text-orange-700 border-orange-200` |
| 发票终审中 | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| 发票被驳回 | `bg-red-50 text-red-700 border-red-200` |
| 已确认/会员资格有效 | `bg-green-50 text-green-700 border-green-200` |
| 已过期 | `bg-gray-100 text-gray-500 border-gray-300` |

### 7.3 响应式

后台管理以桌面端为主（最小宽度 1024px）。移动端可降级为简化布局（侧边栏折叠为汉堡菜单）。

---

## 8. 项目结构

```
paleontology-admin-latest/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components.json              # shadcn/ui 配置
├── index.html
├── .gitignore
├── .prettierrc
├── .prettierignore
│
├── shared/
│   ├── constants.ts             # 从主项目拷贝
│   └── const.ts                 # 从主项目拷贝
│
├── server/
│   └── index.ts                 # Express 生产服务器（可选）
│
├── client/
│   └── src/
│       ├── main.tsx             # 入口
│       ├── App.tsx              # Router + Provider
│       ├── index.css            # Tailwind + 设计令牌
│       │
│       ├── lib/
│       │   └── utils.ts         # cn()
│       │
│       ├── contexts/
│       │   └── AdminContext.tsx  # 管理员认证+角色+业务数据
│       │
│       ├── components/
│       │   ├── AdminLayout.tsx   # 后台外壳（顶栏+侧边栏+内容）
│       │   ├── AdminTopBar.tsx   # 顶栏
│       │   ├── AdminSidebar.tsx  # 侧边栏
│       │   └── ui/              # shadcn/ui 组件（按需拷贝）
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── select.tsx
│       │       ├── input.tsx
│       │       ├── badge.tsx
│       │       ├── sheet.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── checkbox.tsx
│       │       ├── separator.tsx
│       │       ├── tooltip.tsx
│       │       ├── avatar.tsx
│       │       ├── label.tsx
│       │       ├── form.tsx
│       │       ├── textarea.tsx
│       │       ├── skeleton.tsx
│       │       ├── spinner.tsx
│       │       ├── pagination.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── popover.tsx
│       │       ├── scroll-area.tsx
│       │       └── sonner.tsx
│       │
│       └── pages/
│           └── admin/
│               ├── LoginPage.tsx          # 管理员登录
│               ├── Dashboard.tsx          # 首页仪表盘（按角色差异化）
│               ├── AuditWorkbench.tsx     # 审核工作台
│               ├── MemberManagement.tsx   # 会员管理
│               ├── ConferenceManagement.tsx # 会议管理
│               ├── Statistics.tsx         # 数据统计
│               ├── FinanceRecords.tsx     # 财务记录
│               ├── BranchManagement.tsx   # 分会管理
│               └── NotFound.tsx           # 404
```

---

## 9. 实施分期

### 第一期（MVP）— 本次实现

1. 项目骨架搭建（Vite + Tailwind + shadcn/ui）
2. 拷贝共享代码 + 设计令牌
3. AdminContext（认证 + 角色 + 数据）
4. AdminLayout + AdminTopBar + AdminSidebar
5. 登录页
6. 首页仪表盘（三角色差异化）
7. 审核工作台（初审/终审队列 + 批量操作 + 驳回/延期）
8. 会员管理（列表/详情/禁用启用）
9. 会议管理（列表/新建/编辑）
10. 数据统计
11. 财务记录
12. 分会管理

### 第二期（延后）

1. CMS 内容管理（11个一级栏目）
2. 系统配置（邮件模板、会费配置）
3. 操作日志/审计
4. Excel 导出

---

## 10. 附录

### 10.1 关键术语

| 术语 | 定义 |
|------|------|
| 凭证 | 银行汇款/转账的电子回单截图 |
| 发票 | 学会开具的电子发票 |
| 初审 | 财务审核凭证的阶段 |
| 终审 | 财务审核发票的阶段 |
| 宽限期 | 凭证初审通过后，上传发票的7个工作日时限 |
| 工作日 | 周一至周五（不含周末） |

### 10.2 引用文档

- [需求概要](docs/需求概要.md)
- [原型说明文档](docs/原型说明文档.md)
- [完整需求文档](docs/完整需求文档.md)

---

> **— 文档结束 —**
