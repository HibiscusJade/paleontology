# Phase 1：四类会议费 + 分会权限隔离

> **依赖**：Phase 0 完成
> **目标**：建立四类价格模型和分会管理员数据权限，是所有后续功能的基础。

---

## 涉及文件

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/contexts/AdminContext.tsx` | Admin | 重写权限模型、更新种子数据 |
| `client/src/components/AdminSidebar.tsx` | Admin | 分会管理员菜单过滤增强 |
| `client/src/components/AdminLayout.tsx` | Admin | 权限守卫增强 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 四类价格表单 |
| `client/src/contexts/MembershipContext.tsx` | Website | 四类费用计算、学生身份 |
| `client/src/pages/Services.tsx` | Website | 会议费展示、学生身份选择 |

---

## 管理后台修改

### 1. AdminContext.tsx —— 权限模型重写

**当前状态**：
- 3 个硬编码管理员账号（1 个 super_admin, 1 个 branch_admin 绑定 gjzdw, 1 个 finance_reviewer）
- `ROUTE_PERMISSIONS` 仅做路由级访问控制
- `canAccess(path)` 只看角色，不做数据过滤
- 分会管理员能看 `/admin/conferences` 和 `/admin/statistics`，通过 `getBranchConferences(adminBranchId)` 过滤

**修改内容**：

1. **分会管理员账号扩展**：从 1 个分会管理员扩展为 11 个（每个分会 1 个），再加 1 个总学会管理员
   ```ts
   // 每个分会管理员只能访问自己分会的后台
   const BRANCH_ADMIN_ACCOUNTS = {
     "branch_gwjzdwxfh@paleo.org.cn": { branchId: "gwjzdwxfh", name: "古无脊椎动物学分会管理员" },
     "branch_kpgzwyh@paleo.org.cn": { branchId: "kpgzwyh", name: "科普工作委员会管理员" },
     // ... 共 12 个（11 分会 + 1 总学会，总学会管理员归秘书处管理）
   };
   ```

2. **数据权限过滤函数**：新增 `filterByBranchScope<T>(data: T[], branchField: string)` 工具函数，分会管理员调用任何数据查询时自动过滤

3. **统计函数分支过滤**：`getDashboardStats()`、`getBranchDashboardStats()` 等统计函数需要在内部按分支过滤

4. **四类会议费种子数据更新**：
   ```ts
   // 当前种子会议的费用结构从 { memberFee, nonMemberFee } 改为四类价格
   feeConfig: {
     studentMember: 800,
     nonStudentMember: 1200,
     studentNonMember: 900,
     nonStudentNonMember: 1500,
   }
   ```

### 2. AdminSidebar.tsx —— 菜单过滤增强

- 分会管理员：隐藏「用户管理」「分会管理」菜单
- 分会管理员：「数据统计」和「会议管理」仅显示本分会数据
- 新增菜单项标识：哪些菜单项需要按分支过滤

### 3. AdminLayout.tsx —— 权限守卫增强

- 分会管理员访问 `/admin/users/*` 或 `/admin/branches` 时重定向到 `/admin/dashboard`
- 增加数据范围检查：不仅在路由级，在数据加载时也检查

### 4. ConferenceManagement.tsx —— 四类价格表单

- 「新建/编辑会议」弹窗中的费用输入从 2 个字段扩展为 4 个字段
- 每类价格可单独置空（空值 = 关闭该人群报名通道）
- 非会员价格不再自动计算（改为手动输入）
- 费用预览卡片展示四类价格

---

## 用户前台修改

### 5. MembershipContext.tsx —— 四类费用 + 学生身份

- 用户注册/资料编辑时新增「学生/非学生」身份选择（`isStudent: boolean`）
- 新增 `deriveFeeType(userType, isStudent)` 函数
- 会议费查询从 `getConferenceFee(confId, userType)` 改为四类价格查询
- 新增 `getConferenceFeeConfig(confId): ConferenceFeeConfig` 获取完整价格配置
- 新增 `getUserFeeType(): ConferenceFeeType` 获取当前用户对应的费用类型

### 6. Services.tsx —— 会议费展示更新

- 会议详情中展示四类价格表
- 用户报名时自动匹配对应的费用类型并高亮显示
- 学生/非学生身份提示

---

## 验收标准

- [x] 管理后台：四类价格可在创建/编辑会议时独立配置
- [x] 管理后台：分会管理员登录后只能看到本分会的数据
- [x] 管理后台：分会管理员无法访问 `/admin/users/*` 和 `/admin/branches`
- [x] 用户前台：会议详情展示四类价格
- [x] 用户前台：用户可按学生/非学生身份自动匹配会议费类型
- [x] TypeScript 类型检查通过
- [x] 构建通过（`pnpm build`）
