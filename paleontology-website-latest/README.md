# 中国古生物学会网站 (Paleontological Society of China)

中国古生物学会官方门户网站 — 包含学会主站（面向公众）和党建文化子系统（面向内部）的静态 SPA 应用。

## 技术栈

| 技术 | 版本 / 工具 |
|------|------------|
| **框架** | React 19 |
| **构建** | Vite 7 |
| **CSS** | Tailwind CSS 4 + shadcn/ui (New York 风格) |
| **路由** | wouter (支持 pushState / hash 双模式) |
| **服务端** | Express (生产环境静态文件托管) |
| **语言** | TypeScript 5.6 |
| **包管理** | pnpm 10.4+ |

### 核心依赖

- **表单**: react-hook-form + zod 校验
- **动画**: framer-motion + tw-animate-css
- **图表**: recharts
- **轮播**: embla-carousel-react
- **Markdown 渲染**: streamdown
- **Toast**: sonner
- **图标**: lucide-react (组件图标) + Material Symbols (界面图标)
- **地图**: Google Maps (通过 Manus 代理，无需 API Key)

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3000)
pnpm dev

# TypeScript 类型检查
pnpm check

# 代码格式化
pnpm format
```

## 构建与部署

```bash
# 标准构建 — 输出到 dist/ (pushState 路由，部署到 Web 服务器)
pnpm build

# 单文件构建 — 输出单 HTML 文件 (hash 路由，支持 file:// 协议)
pnpm build:singlefile

# 生产环境启动
pnpm start
```

- `pnpm build` 使用 Vite 构建客户端 + esbuild 打包 Express 服务端，输出到 `dist/`。
- `pnpm build:singlefile` 设置 `VITE_HASH_ROUTING=true`，激活 hash 路由，生成可用 `file://` 直接打开的单文件。
- 生产服务端口通过 `PORT` 环境变量配置，默认 3000。

## 项目结构

```
├── client/
│   ├── index.html              # HTML 入口 (Google Fonts <link> 加在这里)
│   ├── public/                 # 仅放 favicon、robots.txt 等小配置文件
│   └── src/
│       ├── main.tsx            # React 入口
│       ├── App.tsx             # 路由定义 & 顶层 Provider 编排
│       ├── index.css           # 全局样式、设计 Token、Tailwind 层
│       ├── pages/              # 页面组件 (每个路由对应一个页面文件)
│       ├── components/
│       │   ├── ui/             # shadcn/ui 基础组件 (button、card、dialog …)
│       │   ├── PartyLayout.tsx # 全局布局壳 (顶栏、侧栏、面包屑、页脚)
│       │   ├── LoginJoinDialog.tsx       # 登录/注册弹窗
│       │   ├── MembershipChoiceDialog.tsx # 首次登录会员路径选择
│       │   ├── Map.tsx          # Google Maps 集成 (Manus 代理)
│       │   └── ErrorBoundary.tsx
│       ├── contexts/
│       │   ├── MembershipContext.tsx  # 核心状态中心 (认证、会员、分会…)
│       │   └── ThemeContext.tsx       # 主题切换 (当前锁定为 light)
│       ├── hooks/              # 自定义 Hooks (useMobile、usePersistFn)
│       └── lib/                # 工具函数 (cn() 等)
├── server/
│   └── index.ts                # 生产 Express 服务端
├── shared/
│   ├── constants.ts            # 领域共享常量 (分会、会议、费用…)
│   └── const.ts                # 通用常量
├── scripts/                    # 构建辅助脚本
└── patches/                    # 依赖补丁 (wouter)
```

### 路径别名

| 别名 | 实际路径 |
|------|---------|
| `@/*` | `client/src/*` |
| `@shared/*` | `shared/*` |
| `@assets/*` | `attached_assets/*` |

## 架构：双站点结构

一个 React 应用中承载两个逻辑"子站"：

### 1. 学会主站（Society Main Portal）

面向公众的页面，包含学会介绍、组织机构、历史沿革、图库、国际交流等：

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | SocietyHome | 学会首页 |
| `/intro` | Intro | 学会介绍 |
| `/structure` | Structure | 组织机构 |
| `/history` | History | 历史沿革 |
| `/gallery` | Gallery | 影像图库 |
| `/society-announcements` | SocietyAnnouncements | 通知公告 |
| `/international` | International | 国际交流 |
| `/downloads-center` | DownloadsCenter | 下载中心 |
| `/regulations` | Regulations | 规章制度 |
| `/services` | Services | 会员服务 |
| `/branches` | Branches | 分支机构 |
| `/personal-center` | PersonalCenter | 个人中心 |

### 2. 党建文化子系统（Party Culture Sub-system）

面向内部的党建页面，均以 `/party` 为基础，含 12 个子页面：

| 路由 | 页面 | 说明 |
|------|------|------|
| `/party` | Home | 党建首页 |
| `/announcements` | Announcements | 通知公告 |
| `/organizations` | Organizations | 组织架构 |
| `/committees` | Committees | 专门委员会 |
| `/work` | Work | 工作动态 |
| `/activities` | Activities | 党建活动 |
| `/team-building` | TeamBuilding | 组织建设 |
| `/theory-study` | TheoryStudy | 理论学习 |
| `/dynamics` | Dynamics | 党建动态 |
| `/special-topics` | SpecialTopics | 专题专栏 |
| `/exemplars` | Exemplars | 榜样力量 |
| `/reporting` | Reporting | 党建述职 |
| `/downloads` | Downloads | 下载专区 |

## 布局规则

`PartyLayout.tsx` 是所有页面的全局布局壳，根据 `isFullWidthPage` 判断布局模式：

| 页面类型 | 布局方式 |
|---------|---------|
| 学会首页 (`/`)、会员服务 (`/services`) | 全宽，无侧栏 |
| 党建页面 (`/party` 及其 12 个子路由) | **双栏布局**：左侧党建导航 + 右侧内容区 |
| 其他页面 (介绍、组织、历史等) | 全宽 + 面包屑导航 |

> 新增需要全宽展示的页面，必须在 `PartyLayout.tsx` 的 `isFullWidthPage` 中添加对应的路径判断。

## 核心状态管理：MembershipContext

`MembershipContext` (`client/src/contexts/MembershipContext.tsx`) 是整个应用的状态中枢，管理：

### 认证
- 注册 / 登录 / 登出 / 注销账号
- 基于 localStorage 的模拟用户数据库（`paleo_user_db`）
- 登录弹窗为 `LoginJoinDialog.tsx`，支持登录、注册、忘记密码三个 Tab
- 登出：顶栏用户下拉中的"安全退出"，清除所有 per-user 状态并跳转首页
- 注销账号："注销账号"永久删除用户数据（PersonalCenter 中两步确认）

### 会员双路径（用户类型）

首次登录时必须通过 `MembershipChoiceDialog` 选择：

| 路径 | userType | 说明 |
|------|----------|------|
| **路径 A — 非会员** | `non_member` | 无需缴费，立即绑定分会、报名会议，**会议费按非会员价**（会员价 × 1.1） |
| **路径 B — 正式会员** | `member` | 需完成两阶段缴费流程（凭证上传→审核→发票上传→审核→激活），审核通过后享受**会员价** |

- 注册后初始身份为 `regular`（普通用户），首次登录强制选择路径
- 非会员可随时通过会员服务页升级为正式会员
- `userType` 存于 localStorage：`paleo_user_type_{email}`

### 学会会费（仅 member 用户）

两阶段缴费审核流程：凭证上传 → 审核 → 发票上传 → 审核 → 完成。
费用标准：普通 ¥200 / 学生 ¥100 / 团体会员 ¥5000。

### 分会绑定

非会员和正式会员均可绑定 / 解绑专业分会；`regular` 用户不可操作。

### 会议报名

两阶段会议费流程 → 提交表单 → 上传摘要。
费用通过 `getConferenceFee(confId, userType)` 自动按用户类型计算。

### 通知

顶栏通知铃铛，支持已读/未读跟踪。

> 所有 per-user 状态持久化在 localStorage 中，key 均以 `paleo_` 为前缀。

## 视觉设计：地层次韵 (Strata & Heritage)

| 角色 | 色值 | 用途 |
|------|------|------|
| 地层深蓝 (Primary) | `#002B49` | 导航栏、标题 |
| 党建红 (Party Red) | `#C41E3A` | 强调边框、按钮、侧栏激活态 |
| 典雅金 (Accent Gold) | `#D9C5A0` | 高亮、页脚标题 |
| 纸色亮白 (Paper Bright) | `#FCFAF7` | 页面背景 |
| 化石石色 (Fossil Stone) | `#E5E1DA` | 边框、卡片边缘 |

- 边框圆角: `0.25rem` — 方正学院风
- 主题固定为 `light` 模式，不可切换
- 自定义 CSS 工具类：`.party-gradient`、`.party-card-border`、`.party-text`、`.xingkai-script`（行楷 Logo 字体）
- 设计理念详见 `ideas.md`

## 开发要点

### 组件体系
- `client/src/components/ui/` 下为 shadcn/ui 基础组件，**禁止重复实现** — 需要时扩展它们
- 新页面放在 `client/src/pages/`，新路由在 `App.tsx` 中注册

### 路由
- 使用 wouter 的 `<Link href="...">` 导航，**不要嵌套 `<a>` 于 `<Link>` 内**
- `<Select.Item>` 必须提供非空的 `value` prop

### 样式
- `.container` 已自定义为自动居中 + 响应式内边距，直接用 `<div className="container">` 即可
- `.flex` 已预设 `min-width:0` 和 `min-height:0`
- 使用语义色类名时必须配对：`bg-primary` + `text-primary-foreground`

### 图标
- 界面 chrome 使用 `material-symbols-outlined` 类
- 组件图标使用 `lucide-react`

### 图片/媒体
- 图片必须通过 Manus CLI 上传，不要放在 `client/public/` 中
- `client/public/` 只放 `favicon.ico`、`robots.txt` 等配置文件

### 共享常量
- 分会 ID、会议费用、状态枚举等领域的真实数据源在 `shared/constants.ts`
- 页面和 Context 中**不要硬编码**这些值 — 从 shared 导入使用

### Google 字体
- 在 `client/index.html` 中通过 `<link>` 引入，**不要**在 CSS 中使用 `@import`

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 生产服务端口 (默认 3000) |
| `VITE_HASH_ROUTING` | 启用 hash 路由 (singlefile 构建自动设置) |
| `NODE_ENV` | `production` 时启用生产模式 |

## 补充说明

- 项目暂无自动化测试（`vitest` 已在 devDependencies 中但无测试文件）
- `patches/wouter@3.7.1.patch` 是 wouter 的一个补丁修复
- Vite 开发服务器包含自定义插件：Manus Runtime 桥接、JSX 位置注入、调试日志收集、存储代理
