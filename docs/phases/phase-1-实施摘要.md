# Phase 1 实施摘要：四类会议费 + 分会权限隔离

> **实施日期**：2026-06-21
> **依赖**：Phase 0 完成
> **状态**：✅ 已完成

---

## 修改文件清单

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/contexts/AdminContext.tsx` | Admin | 权限模型重写、种子数据更新、数据过滤 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 分会选项限定、表单预填 |
| `client/src/pages/Services.tsx` | Website | 四类费用展示、个性化费用计算 |
| `client/src/pages/PersonalCenter.tsx` | Website | 资料保存调用 updateProfile、isStudent 同步 |

> **无需修改的文件**：`AdminSidebar.tsx`、`AdminLayout.tsx` 的路由权限模型已通过 `ROUTE_PERMISSIONS` 自行满足 Phase 1 的分会管理员菜单过滤和页面重定向要求。

---

## 一、管理后台

### 1.1 内置管理员账号扩展

从 3 个账号扩展为 **13 个**（1 super_admin + 11 branch_admin + 1 finance_reviewer）：

| 角色 | 账号 | 分会 |
|------|------|------|
| 学会总管理员 | `admin@paleontology.org.cn` | — |
| 古无脊椎 | `branch_gwjzdwxfh@paleo.org.cn` | 古无脊椎动物学分会 |
| 科普委 | `branch_kpgzwyh@paleo.org.cn` | 科普工作委员会 |
| 孢粉学 | `branch_bfxfh@paleo.org.cn` | 孢粉学分会 |
| 微体学 | `branch_wtxfh@paleo.org.cn` | 微体学分会 |
| 化石藻类 | `branch_hszlzwyh@paleo.org.cn` | 化石藻类专业委员会 |
| 古植物 | `branch_gzwxfh@paleo.org.cn` | 古植物学分会 |
| 地球生物 | `branch_dqswx@paleo.org.cn` | 地球生物学分会 |
| 古生态 | `branch_gst@paleo.org.cn` | 古生态专业分会 |
| 古脊椎 | `branch_gjzdw@paleo.org.cn` | 古脊椎动物学分会 |
| 生物沉积 | `branch_swcj@paleo.org.cn` | 生物沉积学分会 |
| 新技术 | `branch_xjsxff@paleo.org.cn` | 新技术新方法专业委员会 |
| 财务审核员 | `finance@paleontology.org.cn` | — |

> 所有账号密码统一为 `admin123`

### 1.2 数据权限过滤

新增两个工具函数，所有数据查询入口统一调用：

- **`filterByBranchScope<T>(data, branchField, adminRole, adminBranchId)`** — 泛型过滤，适用于按 `branchId` 字段筛选的数据集
- **`filterMembersByBranchScope(members, adminRole, adminBranchId)`** — 会员专属过滤，按 `boundBranches` 数组匹配

以下函数已内置分支过滤：

| 函数 | 过滤逻辑 |
|------|----------|
| `getAllMembers()` | 仅返回已绑定当前分会的会员 |
| `getAllConferences()` | 仅返回 `branchId` 匹配的会议 |
| `getDashboardStats()` | 整体统计 + 分支人数均限定范围 |
| `getAllPaymentRecords()` | 仅返回当前分会会员的支付记录 |
| `getAllBranches()` | 仅返回当前分会自身 |

### 1.3 写入权限守卫

- **`createConference`**：分会管理员指定的 `branchId` 必须等于本人分会，否则拒绝创建
- **`updateConference`**：分会管理员只能修改本人分会的会议，否则拒绝更新
- 分会管理员的会议编辑表单中，「主办分会」下拉框锁定为本分会且不可修改

### 1.4 种子数据更新

三场默认会议均添加完整 `feeConfig`：

```ts
feeConfig: {
  studentMember: 800,          // 学生会员
  nonStudentMember: 1200,      // 非学生会员
  studentNonMember: 900,       // 学生非会员
  nonStudentNonMember: 1500,   // 非学生非会员
}
```

---

## 二、用户前台

### 2.1 会议详情 —— 四类费用表

会议详情弹窗（"详细通知"）中的缴费说明部分，从旧的「正式会员 / 非会员」双价格格式，替换为完整的四类费用表：

```
┌─────────────────────────────────────────┐
│ 学生会员             ¥800  [您的类型]   │
│ 非学生会员           ¥1200              │
│ 学生（非会员）       ¥900               │
│ 非学生（非会员）     ¥1500              │
└─────────────────────────────────────────┘
```

- 表格项自动判断当前用户身份并高亮对应行（绿色边框 + "您的类型" 标签）
- 值为 0 的费用类型显示 `--（关闭）`，表示该报名通道关闭

### 2.2 会议列表 / 卡片 —— 个性化费用

所有会议卡片上的注册费金额不再使用固定的 `CONFERENCE_FEE_MEMBER` 值，改为根据当前用户身份**动态计算**：

```
注册费：¥800 元（学生会员）
注册费：¥1500 元（非学生非会员）
```

推导链路：`userType + isStudent` → `deriveFeeType()` → `getConferenceFeeConfig()` → 匹配金额

### 2.3 个人中心 —— isStudent 持久化

- **资料保存**：`handleSaveProfile` 现在调用 `updateProfile` 持久化数据，同时自动从 `role` 字段推导 `isStudent`（`role === "学生"` → `isStudent: true`）
- **注册表单**：`LoginJoinDialog` 中 `register` 调用时已将 `isStudent` 同步写入 User 对象

---

## 三、验收结果

| # | 验收项 | 结果 |
|---|--------|------|
| 1 | 管理后台四类价格可独立配置 | ✅ 新建/编辑会议表单含 4 个输入框，可单独置空 |
| 2 | 分会管理员只能看到本分会数据 | ✅ 所有查询函数已内置过滤 |
| 3 | 分会管理员无法访问 users/branches | ✅ `ROUTE_PERMISSIONS` 仅允许 super_admin |
| 4 | 用户前台会议详情展示四类价格 | ✅ 弹窗内四行费用表 + 用户类型高亮 |
| 5 | 学生/非学生自动匹配会议费 | ✅ `isStudent` → `deriveFeeType` → 个性化金额 |
| 6 | TypeScript 类型检查通过 | ✅ `pnpm check` 两端均无错误 |
| 7 | 构建通过 | ✅ `pnpm build` 两端成功 |
