# Phase 4 实施摘要：摘要提交 + 住宿信息 + 野外报名

> **日期**：2026-06-21
> **状态**：✅ 已完成
> **依赖**：Phase 1（四类会议费 + 缴费流程）、Phase 3（三层统计结构）已完成

---

## 修改文件清单

| 文件 | 项目 | 修改类型 | 说明 |
|------|------|----------|------|
| `client/src/contexts/MembershipContext.tsx` | Website | 扩展 | 新增 `ConferenceReg` 字段（摘要/住宿/野外）+ 3 个新操作 |
| `client/src/pages/Services.tsx` | Website | 重写表单 | 会议报名表单新增三个子模块（A/B/C），全部 11 场会议新增截止时间和路线数据 |
| `client/src/contexts/AdminContext.tsx` | Admin | 扩展类型 | `ConferenceRecord`/`ConferenceData` 新增住宿/野外截止时间、野外路线字段 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 新增面板 | 住宿/野外截止时间配置 + 野外路线动态配置面板（最多 15 条） |

---

## 实施内容

### 1. MembershipContext.tsx — 类型与操作扩展

**ConferenceReg 新增字段：**

```ts
// Phase 4: 摘要文件
abstractFileUrl?: string;       // 上传后的文件 URL
abstractSubmitTime?: string;    // 提交时间戳

// Phase 4: 住宿（性别化选项，替代旧的 accommodation: "单间" | "双人间" | "自行安排"）
accommodationType?: "male_single" | "male_double" | "female_single" | "female_double" | "self_arranged";

// Phase 4: 野外报名
fieldTripSelections?: {
  pre: string[];      // 会前选中的路线 ID
  during: string[];   // 会中选中的路线 ID
  post: string[];     // 会后选中的路线 ID
};
```

**新增 Context 方法：**

| 方法 | 签名 | 说明 |
|------|------|------|
| `uploadAbstractFile` | `(confId, fileUrl, fileName) => void` | 上传摘要文件（同时设置 URL、文件名、提交时间） |
| `setAccommodation` | `(confId, type: AccommodationType) => void` | 设置性别化住宿类型 |
| `toggleFieldTripRoute` | `(confId, phase, routeId) => void` | 切换单条野外路线选择（选中/取消） |
| `deleteAbstract` | `(confId) => void` | 已有（清除 abstractFileName），新增清除 abstractFileUrl |

### 2. Services.tsx — 会议报名表单三模块

在已有的会议报名表单（`editingReg` 视图）中新增三个模块，表单结构：

```
填写参会及报告信息
├── 参会人基本信息（姓名、单位、性别、职务）
├── 学术报告与论文摘要（报告形式、分会场、题目）
│
├── 📄 模块 A：会议论文摘要提交              ← 新增
│   ├── 截止时间显示 + 已截止标签
│   ├── 上传按钮（.doc / .docx）
│   ├── 已上传状态：文件名 + 重新上传 + 删除
│   ├── 截止前：自由替换/删除
│   └── 截止后：红色"已截止"提示，操作禁用
│
├── 🏨 模块 B：住宿信息                       ← 重写
│   ├── 截止时间显示（开会前7天）
│   ├── 5个 Radio 选项：
│   │   ├── 男单间（¥450/晚）  ← 男用户自动"推荐"
│   │   ├── 男双人间（¥240/晚） ← 男用户自动"推荐"
│   │   ├── 女单间（¥450/晚）  ← 女用户自动"推荐"
│   │   ├── 女双人间（¥240/晚） ← 女用户自动"推荐"
│   │   └── 自主安排
│   ├── 性别智能推荐：选项根据 regForm.gender 显示金色边框 + "推荐"标签
│   └── 截止后：红色提示 + 未提交视为自主安排
│
├── 🏔️ 模块 C：会议野外报名                    ← 新增
│   ├── 截止时间显示（开会前7天）
│   ├── 按阶段分组（会前 / 会中 / 会后）
│   ├── Checkbox 多选（从 conference.fieldTripRoutes 读取）
│   ├── 截止后禁用
│   ├── 费用提示（旅游公司收取，不纳入学会会议费）
│   └── 无路线时显示"本会议暂无野外路线安排"
│
└── 提交按钮
```

**全部 11 场会议数据更新：**
- 每场会议新增 `accommodationDeadline` 和 `fieldTripDeadline` 字段
- `demo-conf`、`conf-1`、`conf-3`、`conf-4`、`conf-6`、`conf-zgswxh-1`、`conf-zgswxh-2` 配置了示例野外路线（1~5 条）

**快速提交弹窗更新：**
- 住宿下拉框从旧 3 选项（单间/双人间/自行安排）更新为新 5 选项（男单/男双/女单/女双/自主安排）

### 3. AdminContext.tsx — 类型与种子数据

**ConferenceRecord / ConferenceData 新增字段：**

```ts
accommodationDeadline?: string;  // 住宿截止日期
fieldTripDeadline?: string;      // 野外报名截止日期
fieldTripRoutes?: {              // 野外路线配置
  id: string;
  phase: "pre" | "during" | "post";
  name: string;
  order: number;
}[];
```

**种子数据更新：**
- 3 场默认会议均配置了 `accommodationDeadline`、`fieldTripDeadline`
- `conf-1` 和 `conf-3` 配置了示例野外路线

### 4. ConferenceManagement.tsx — 管理后台配置

**新增截止时间字段：**

```
缴费截止日期  [date picker]
摘要截止日期  [date picker]
住宿截止日期  [date picker]  ← 新增，标注"开会前7天"
野外报名截止  [date picker]  ← 新增，标注"开会前7天"
```

**野外路线配置面板（新增独立区块）：**

```
野外路线配置                                    2 / 15 条
┌──────────────────────────────────────────────────────┐
│ [会前 ▼] [路线一：澄江化石地考察          ] [1] [🗑] │
│ [会后 ▼] [路线一：关山生物群野外考察      ] [2] [🗑] │
└──────────────────────────────────────────────────────┘
[＋ 添加野外路线]

每场会议最多 15 条路线，分属会前/会中/会后三个阶段
```

- 每条路线可配置：所属阶段（Select）、路线名称（Input）、序号（Number input，1-15）
- 支持动态添加/删除
- 超过 15 条时添加按钮自动禁用
- 空名称路线在提交时自动过滤

**会议卡片增强：**
- 卡片底栏新增野外路线数量指示（`🏔️ N条路线`）

---

## 验收标准检查

| 标准 | 状态 |
|------|------|
| 用户前台：缴费确认后可提交摘要 Word（.doc/.docx） | ✅ |
| 用户前台：摘要截止前可自由删除替换，截止后不可修改 | ✅ |
| 用户前台：住宿选项区分男单/男双/女单/女双/自主安排 | ✅ |
| 用户前台：住宿根据用户性别智能推荐 | ✅ |
| 用户前台：野外报名支持会前/会中/会后多选 | ✅ |
| 用户前台：住宿和野外截止后不可修改 | ✅ |
| 管理后台：可配置每场会议的摘要/住宿/野外截止时间 | ✅ |
| 管理后台：可配置每场会议的野外路线（名称和阶段） | ✅ |
| TypeScript 类型检查通过（`pnpm check`） | ✅ |
| 构建通过（`pnpm build`） | ✅ |

---

## 技术说明

- **住宿性别推荐逻辑**：前端根据 `regForm.gender`（"男"/"女"）匹配对应选项，未选择时显示金色边框 + "推荐"标签，选择后以深蓝选中态覆盖
- **野外路线来源**：管理后台将路线配置写入 `localStorage` → `paleo_admin_conferences_db`，前台从硬编码 conferences 数组读取（原型阶段）。后续对接后可从 localStorage 统一读取
- **截止时间校验**：三个截止时间独立校验（`abstractDeadline` / `accommodationDeadline` / `fieldTripDeadline`），超期后对应模块的 UI 操作全部禁用
- **向后兼容**：`ConferenceReg.accommodation`（旧字段 `"单间" | "双人间" | "自行安排"`）标记为 `@deprecated`，与新的 `accommodationType` 共存，无需迁移历史数据
- **文件存储**：原型阶段使用模拟 URL（`https://example.com/abstracts/...`），真实环境中需对接文件上传服务
