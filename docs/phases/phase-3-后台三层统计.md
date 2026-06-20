# Phase 3：后台三层统计

> **依赖**：Phase 1、Phase 2 完成（需要四类价格和总学会模型就位）
> **目标**：实现总管理员整体统计、单个学会/分会累计统计、单次会议统计三个层级。

---

## 涉及文件

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/pages/admin/Dashboard.tsx` | Admin | 重写统计卡片和图表 |
| `client/src/pages/admin/Statistics.tsx` | Admin | 重写为三层统计页面 |
| `client/src/contexts/AdminContext.tsx` | Admin | 新增分层统计函数 |

---

## 管理后台修改

### 1. Statistics.tsx —— 重写为三层统计

**当前状态**：简单的摘要卡片 + 分会用户分布图 + 会议费用表

**修改后结构**：

```
Statistics 页面
├── 层级选择器（总览 / 按学会查看 / 按会议查看）
│
├── 层级 1：总管理员整体统计（默认视图，super_admin 可见）
│   ├── 人数统计卡片
│   │   ├── 总注册人数
│   │   ├── 总会员人数（学生会员 / 非学生会员）
│   │   └── 非会员总人数（学生非会员 / 非学生非会员）
│   ├── 会员费统计卡片
│   │   ├── 会员费累计总金额
│   │   ├── 学生会员费：笔数 + 累计金额
│   │   └── 非学生会员费：笔数 + 累计金额
│   ├── 会议费统计卡片
│   │   ├── 全部学会会议费累计总金额
│   │   └── 12 个学会各自会议费累计金额（条形图）
│   └── 分会对比图表
│       ├── 各分会会员分布（堆叠条形图）
│       └── 各分会四类会议费分布（分组条形图）
│
├── 层级 2：单个学会/分会累计统计（下拉选择学会）
│   ├── 学会基本信息 + 累计参会总人数
│   ├── 会员结构：学生会员 / 非学生会员 / 非会员（学生/非学生）
│   ├── 累计会议费：总金额 + 四类分项（笔数 + 金额）
│   └── 该学会历史会议列表 + 各会议报名人数
│
├── 层级 3：单次会议统计（下拉选择会议）
│   ├── 会议基本信息
│   ├── 会议费：总金额 + 四类分项（笔数 + 金额）
│   ├── 参会人数 = 四类笔数之和
│   ├── 报告统计：总报告数 / 口头报告 / 展板报告
│   ├── 住宿统计：总房间数 / 男单 / 男双 / 女单 / 女双
│   └── 野外统计：会前/会中/会后 总人数 / 男性 / 女性
│
└── 导出按钮（每个层级独立导出，Phase 5 实现）
```

### 2. AdminContext.tsx —— 分层统计函数

新增以下统计函数：

```ts
// 总管理员整体统计
getGlobalStats(): GlobalStats

// 单个学会/分会累计统计
getSocietyStats(societyId: string): SocietyStats

// 单次会议统计
getConferenceStats(confId: string): ConferenceStats

// 统计数据结构
interface GlobalStats {
  totalUsers: number;
  totalMembers: number;
  studentMembers: number;
  nonStudentMembers: number;
  totalNonMembers: number;
  studentNonMembers: number;
  nonStudentNonMembers: number;
  totalMembershipFee: number;
  studentMembershipFeeCount: number;
  studentMembershipFeeAmount: number;
  nonStudentMembershipFeeCount: number;
  nonStudentMembershipFeeAmount: number;
  totalConferenceFee: number;
  perSocietyConferenceFee: Record<string, number>; // 12 个学会各自累计
}

interface SocietyStats {
  societyId: string;
  societyName: string;
  totalAttendees: number;         // 累计参会总人数
  totalMembers: number;
  studentMembers: number;
  nonStudentMembers: number;
  totalNonMembers: number;
  studentNonMembers: number;
  nonStudentNonMembers: number;
  totalConferenceFee: number;
  feeBreakdown: {                  // 四类会议费分项
    studentMember: { count: number; amount: number };
    nonStudentMember: { count: number; amount: number };
    studentNonMember: { count: number; amount: number };
    nonStudentNonMember: { count: number; amount: number };
  };
}

interface ConferenceStats extends SocietyStats {
  confId: string;
  confName: string;
  totalReports: number;
  oralReports: number;
  posterReports: number;
  accommodation: {
    totalRooms: number;
    maleSingle: number;
    maleDouble: number;
    femaleSingle: number;
    femaleDouble: number;
  };
  fieldTrips: {
    pre: { total: number; male: number; female: number };
    during: { total: number; male: number; female: number };
    post: { total: number; male: number; female: number };
  };
}
```

### 3. Dashboard.tsx —— 超级管理员视图更新

- 首页仪表盘中超级管理员视图新增：
  - 四类人群分布概览卡片
  - 12 学会会议费收入概览（迷你条形图）
  - 各学会参会人数热力表格

---

## 验收标准

- [ ] 超级管理员：可查看整体统计（总人数、会员结构、会议费总额、各学会对比）
- [ ] 超级管理员：点击某个学会后仅显示该学会统计
- [ ] 超级管理员：点击某场会议后仅显示该会议统计
- [ ] 分会管理员：默认显示本分会累计统计 + 本分会各会议统计
- [ ] 所有统计数据按四类会议费分别展示笔数和金额
- [ ] 图表使用 recharts 渲染（与现有风格一致）
- [ ] TypeScript 类型检查通过
- [ ] 构建通过
