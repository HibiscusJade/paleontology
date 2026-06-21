# 中国古生物学会 · 管理后台

中国古生物学会（Palaeontological Society of China）管理后台 —— 基于 React 的浏览器端单页应用（SPA），用于管理学会及其 11 个分会的会员、学术会议、财务审核、统计数据和分支机构。

> **注意：** 当前版本为**纯前端原型**，所有数据存储在浏览器 `localStorage` 中，首次加载时会自动填充演示数据。无需后端服务器即可完整体验全部功能。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | React 19 |
| **语言** | TypeScript 5.6 |
| **构建工具** | Vite 7 |
| **包管理器** | pnpm 10 |
| **CSS 框架** | Tailwind CSS v4 |
| **组件库** | shadcn/ui (New York 风格) + Radix UI 原语 |
| **路由** | wouter (支持 Hash 路由) |
| **表单** | react-hook-form + zod 校验 |
| **图表** | recharts |
| **动画** | framer-motion |
| **图标** | lucide-react |
| **文件导出** | JSZip + file-saver |

---

## 项目结构

```
paleontology-admin-latest/
├── client/                          # 应用源码（Vite root）
│   ├── index.html                   # 开发入口 HTML
│   ├── 中国古生物学会_管理后台.html  # 单文件构建入口 HTML
│   └── src/
│       ├── main.tsx                 # 应用入口
│       ├── App.tsx                  # 路由定义
│       ├── index.css                # Tailwind + CSS 变量主题
│       ├── components/              # 布局组件
│       │   ├── AdminLayout.tsx      # 认证布局（侧边栏 + 顶栏 + 内容区）
│       │   ├── AdminSidebar.tsx     # 导航侧边栏（角色权限过滤）
│       │   └── AdminTopBar.tsx      # 顶栏（通知 + 用户菜单）
│       ├── contexts/
│       │   └── AdminContext.tsx      # 全局状态管理（认证/数据/CRUD/审计/统计）
│       ├── hooks/
│       │   └── useComposition.ts    # 中文输入法 composition 事件处理
│       ├── lib/
│       │   └── utils.ts             # cn() 工具函数
│       ├── pages/admin/
│       │   ├── LoginPage.tsx         # 登录页
│       │   ├── Dashboard.tsx         # 仪表盘（统计卡片、图表、审核队列）
│       │   ├── AuditWorkbench.tsx     # 财务审核工作台
│       │   ├── MemberManagement.tsx   # 会员管理
│       │   ├── NonMemberManagement.tsx# 非会员用户管理
│       │   ├── ConferenceManagement.tsx# 学术会议管理
│       │   ├── Statistics.tsx        # 三级统计（全局/分会/会议）
│       │   ├── FinanceRecords.tsx    # 财务记录与导出
│       │   ├── BranchManagement.tsx  # 分支机构管理
│       │   └── NotFound.tsx          # 404 页面
│       └── ui/                      # shadcn/ui 组件（25+）
├── shared/                          # 共享常量
│   ├── const.ts                     # Cookie 名称等
│   └── constants.ts                 # 费用配置、状态枚举、分会映射等
├── docs/                            # 文档目录
├── vite.config.ts                   # Vite 配置（标准构建）
├── vite.singlefile.config.ts        # Vite 配置（单文件构建）
├── tsconfig.json                    # TypeScript 配置
├── components.json                  # shadcn/ui 配置
└── package.json                     # 项目清单
```

---

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **pnpm** ≥ 10（推荐使用 `corepack enable && corepack prepare pnpm@latest --activate`）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:3001，局域网可访问）
pnpm dev

# TypeScript 类型检查
pnpm check

# 代码格式化
pnpm format
```

### 构建

```bash
# 标准 SPA 构建 → dist/
pnpm build

# 预览构建结果
pnpm preview

# 单文件 HTML 构建 → dist/singlefile/
# 所有 JS/CSS 内联，可通过 file:// 协议直接打开
pnpm build:singlefile
```

---

## 功能模块

### 认证与权限

系统内置三种角色，共 13 个演示账号：

| 角色 | 权限范围 | 演示账号 |
|------|----------|----------|
| **学会总管理员** (super_admin) | 全部功能 | `admin@paleo.cn` |
| **分会管理员** (branch_admin) | 管理本分会会议、统计 | 11 个分会各一个账号 |
| **财务审核员** (finance_reviewer) | 审核、财务记录 | `finance@paleo.cn` |

> 所有演示账号密码均为 `123456`。登录页会展示可用账号列表。

### 功能页面

| 路由 | 页面 | 功能描述 |
|------|------|----------|
| `/admin/login` | 登录 | 表单登录，zod 校验，演示账号提示 |
| `/admin/dashboard` | 仪表盘 | 统计卡片、柱状图/饼图、最近审核队列、12 分会费用图表 |
| `/admin/audit` | 审核工作台 | 两阶段缴费审核（凭证→发票）、会员申请审核、批量操作 |
| `/admin/users/members` | 会员管理 | 搜索/筛选、详情面板、手动激活/到期、启用/禁用 |
| `/admin/users/non-members` | 非会员管理 | 非会员用户管理 |
| `/admin/conferences` | 会议管理 | 会议 CRUD、4 档费用配置、文件上传（盖章通知/摘要模板）、住宿/考察路线 |
| `/admin/statistics` | 统计中心 | 三级钻取：全局 → 分会 → 会议，含费用明细和报告统计 |
| `/admin/finance` | 财务记录 | 缴费记录浏览/筛选/详情，按会议/分会 ZIP 导出 |
| `/admin/branches` | 分会管理 | 编辑分会名称/简介/Logo，启用/禁用分会 |

---

## 数据模型

所有数据以 `paleo_admin_*` 为 key 前缀存储在 `localStorage` 中，包括：

- **Users** — 管理员账号（邮箱、姓名、密码、性别、单位、角色）
- **Memberships** — 会员记录（2 阶段缴费流程：凭证审核 → 发票审核）
- **Conferences** — 学术会议（4 档费用、截止日期、分会场、考察路线、住宿）
- **Branches** — 11 个分会 + 1 个总会
- **Audit Logs** — 审核操作日志
- **Notifications** — 管理员通知系统

首次加载时 `seedDemoData()` 会自动生成 30+ 位中国古生物研究者的模拟数据。

---

## 构建模式

### 标准 SPA 构建

```bash
pnpm build
```

- 输出到 `dist/`
- 使用 HTML5 History 路由
- 适合部署到 Web 服务器（需配置 SPA fallback）

### 单文件 HTML 构建

```bash
pnpm build:singlefile
```

- 输出到 `dist/singlefile/`
- 所有 JS/CSS 内联为单个 HTML 文件
- 强制使用 Hash 路由（兼容 `file://` 协议）
- 可通过浏览器直接打开，无需 Web 服务器
- 文件上限 100MB

---

## 配置说明

### Vite 路径别名

| 别名 | 路径 |
|------|------|
| `@` | `client/src/` |
| `@shared` | `shared/` |

### 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_HASH_ROUTING` | 设为 `"true"` 时启用 Hash 路由（单文件构建自动设置） |

---

## 开发指南

### 组件约定

- 页面组件位于 `client/src/pages/admin/`
- 布局组件位于 `client/src/components/`
- UI 基础组件位于 `client/src/ui/`（由 shadcn/ui 生成）
- 全局状态集中在 `AdminContext.tsx` 中管理

### 样式

- 使用 Tailwind CSS v4 工具类
- 自定义主题变量定义在 `client/src/index.css` 的 `@theme` 块中
- 使用 `cn()` 工具函数合并类名（`clsx` + `tailwind-merge`）
- 组件变体使用 `class-variance-authority`

### 表单处理

- 使用 `react-hook-form` 管理表单状态
- 使用 `zod` 定义校验 schema
- 通过 `@hookform/resolvers` 集成

### 中文输入

- `useComposition` hook 处理 IME 组合输入事件
- 在搜索框等需要即输即搜的组件中使用，避免中文输入过程中误触发搜索

---

## 三级统计字段（Phase 3 / MRD 对齐）

所有会议相关数字均通过 `collectConferenceAttendees` 从 `paleo_admin_confs_*` 实收聚合，**禁止**用 `registrations` 字段估算。

| 层级 | 主要指标 |
|------|----------|
| **全局** | 总注册/会员/非会员（含学生分层）、会员费累计（学生/非学生笔数金额）、12 学会会议费分项 |
| **学会/分会** | 累计确认参会人数、四类人群人数、四类会议费笔数/金额 |
| **单次会议** | 四类费用笔数/金额、确认参会总人数、口头/展板报告、住宿（总房间/男单/男双/女单/女双）、野外（会前/会中/会后 × 总/男/女） |

Dashboard「实收缴费趋势」来自近 12 个月已确认会员费/会议费笔数。

## ZIP 导出目录规范

```
export_{scope}_{id}_{date}/
├── 学生会员/缴费凭证/、电子发票/
├── 非学生会员/…
├── 学生（非会员）/…
├── 非学生（非会员）/…
└── 汇总台账.csv
```

- 全局导出：`export_global_all_{date}/{学会名}/…`
- 单文件命名：`{姓名}_{身份}_{日期}_{流水号}.ext`
- 超过 1GB 自动拆分为多个 ZIP 包

## 与用户端 localStorage 联调

管理端审核/导出读取 `paleo_admin_*` key；审核写回时同步 `paleo_*` key（与用户端 Phase 2 双写约定一致）：

| 管理端 | 用户端 |
|--------|--------|
| `paleo_admin_membership_application_{email}` | `paleo_membership_application_{email}` |
| `paleo_admin_withdrawal_application_{email}` | `paleo_withdrawal_application_{email}` |
| `paleo_admin_society_membership_{email}` | `paleo_society_membership_{email}` |
| `paleo_admin_confs_{email}` | `paleo_confs_{email}` |

入会/退会/凭证/发票审核均双向同步；用户端通过 `storage` 事件 + 轮询刷新状态。

---

## 路线图（已完成阶段）

- **Phase 0** — 数据模型更新（4 档费用、用户身份、住宿/考察路线）
- **Phase 1** — 分会管理员数据隔离、4 档会议费用配置
- **Phase 2** — 文件上传管理（盖章通知、摘要模板）
- **Phase 3** — 三级统计实收聚合、Dashboard 缴费趋势、ZIP 分类导出、入会/退会审核联调、分会会议 Tab
- **Phase 4** — 生产栈对齐（Vue 子模块 + 后端 API）
- **Phase 5** — 文档同步与验收

---

## License

MIT
