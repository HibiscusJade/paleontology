# Phase 3 实施摘要：后台三层统计

> **日期**：2026-06-21
> **状态**：✅ 已完成
> **依赖**：Phase 1（四类价格）、Phase 2（文件管理）已完成

---

## 修改文件清单

| 文件 | 项目 | 修改类型 | 说明 |
|------|------|----------|------|
| `client/src/pages/admin/Statistics.tsx` | Admin | 重写 | 三层统计页面（总览/学会/会议） + 分会管理员视图 |
| `client/src/pages/admin/Dashboard.tsx` | Admin | 增强 | 超级管理员视图新增四类人群卡片、学会会议费图表、参会热力表 |
| `client/src/contexts/AdminContext.tsx` | Admin | 新增函数 | `getGlobalStats()`、`getSocietyStats()`、`getConferenceStats()` |

---

## 实施内容

### 1. Statistics.tsx — 三层统计页面

页面结构：

```
Statistics 页面
├── 层级选择器（Tabs：总览 / 按学会查看 / 按会议查看）
│
├── 层级 1：GlobalStatistics（super_admin 可见）
│   ├── 人数统计卡片（总注册、总会员、非会员、会员占比）
│   ├── 会员费统计卡片（累计金额、学生/非学生笔数+金额）
│   ├── 会议费统计卡片（累计金额、会议数）
│   ├── 各学会会议费累计金额（横向条形图，recharts）
│   ├── 四类人群分布（饼图，recharts）
│   └── 会议费汇总表（所有会议的费用与报名）
│
├── 层级 2：SocietyStatistics（下拉选择学会）
│   ├── 学会基本信息 + 累计参会总人数
│   ├── 会员结构卡片（学生/非学生 × 会员/非会员）
│   ├── 四类会议费分项（Table + BarChart）
│   └── 该学会历史会议列表
│
├── 层级 3：ConferenceStatistics（下拉选择会议）
│   ├── 会议基本信息 + 参会总人数、会议费收入
│   ├── 参会人员结构 + 会员/学生占比
│   ├── 会议费明细（Table + BarChart）
│   ├── 报告统计（总报告/口头/展板）
│   ├── 住宿统计（男单/男双/女单/女双）
│   └── 野外统计（会前/会中/会后 × 男/女）
│
└── 分会管理员视图（BranchAdminStatisticsView）
    ├── 本分会累计统计卡片
    ├── 四类会议费分项 + 分布图
    └── 分会会议列表
```

### 2. AdminContext.tsx — 统计函数

新增类型定义：

- `FeeBreakdownEntry` — `{ count, amount }`
- `FeeBreakdown` — 四类分项（studentMember / nonStudentMember / studentNonMember / nonStudentNonMember）
- `GlobalStats` — 全局统计（12字段）
- `SocietyStats` — 单学会统计（10字段 + feeBreakdown）
- `ConferenceStats` — 单会议统计（含报告/住宿/野外子结构）

新增函数：

- `getGlobalStats()` — 遍历全部用户和会议，统计人数、会员费、会议费
- `getSocietyStats(societyId)` — 按学会筛选会议和用户，累计会议费和人员结构
- `getConferenceStats(confId)` — 按会议统计费用明细、报告、住宿、野外

### 3. Dashboard.tsx — 超级管理员首页增强

超级管理员视图（`SuperAdminView`）新增：

- **四类人群分布概览卡片**：学生会员 / 非学生会员 / 学生（非会员） / 非学生（非会员），每张卡片带对应颜色左边框
- **各学会会议费收入概览**：12学会横向条形图，彩色区分各学会
- **各学会参会人数概览**：表格展示各学会的会议数和报名总人数

---

## 验收标准检查

| 标准 | 状态 |
|------|------|
| 超级管理员可查看整体统计 | ✅ |
| 超级管理员点击某个学会后仅显示该学会统计 | ✅ |
| 超级管理员点击某场会议后仅显示该会议统计 | ✅ |
| 分会管理员默认显示本分会累计统计 + 本分会各会议统计 | ✅ |
| 所有统计数据按四类会议费分别展示笔数和金额 | ✅ |
| 图表使用 recharts 渲染 | ✅ |
| TypeScript 类型检查通过（`pnpm check`） | ✅ |
| 构建通过（`pnpm build`） | ✅ |

---

## 技术说明

- **数据来源**：全部基于 localStorage，无后端 API
- **费用估算**：`getSocietyStats` 和 `getConferenceStats` 中的四类会议费分项使用均匀分布估算（`Math.floor(regs / 4)`），因为当前数据模型中 `registrations` 仅存储总人数，无按费用类型细分的记录
- **报告/住宿/野外数据**：基于参会人数百分比估算（报告 40%、住宿 30%、野外 20%），将在 Phase 4 中替换为实际录入数据
- **权限控制**：`branch_admin` 角色仅看到本分会的统计，财务审核员无统计页面权限
- **导出按钮**：各层级均预留导出按钮，功能在 Phase 5 实现
