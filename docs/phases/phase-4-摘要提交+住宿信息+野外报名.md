# Phase 4：摘要提交 + 住宿信息 + 野外报名

> **依赖**：Phase 1 完成（需要四类费用和缴费流程就位）
> **目标**：在会议提交流程中新增摘要 Word 上传、性别化住宿选择、野外路线报名三个子模块。

---

## 涉及文件

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/pages/Services.tsx` | Website | 新增摘要/住宿/野外表单区域 |
| `client/src/contexts/MembershipContext.tsx` | Website | 新增摘要/住宿/野外状态管理 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 截止时间配置、野外路线配置 |
| `client/src/pages/admin/Statistics.tsx` | Admin | 住宿/野外统计数据（已在 Phase 3 实现结构） |
| `client/src/contexts/AdminContext.tsx` | Admin | 摘要/住宿/野外数据查询 |

---

## 用户前台修改

### 1. Services.tsx —— 会议表单扩展

在现有的会议报名表单（`ConferenceForm` 区域）中新增三个模块：

#### 模块 A：摘要提交

```
┌─────────────────────────────────────────┐
│ 📄 会议论文摘要提交                       │
│ 截止时间：2026-08-15（开会前1个月）        │
│                                         │
│ [已上传] 论文摘要_v2.docx                 │
│ [重新上传] [删除]                         │
│                                         │
│ ⚠️ 截止后不可修改，系统只保留最后一次提交    │
└─────────────────────────────────────────┘
```
- 文件类型限制：`.doc`, `.docx`
- 截止时间校验：超过 `abstractDeadline` 后禁用上传和删除
- 截止后显示「已截止」标签
- 上传替换逻辑：覆盖旧文件，只保留最后一次 URL
- 删除后可以重新上传（截止前）

#### 模块 B：住宿信息

```
┌─────────────────────────────────────────┐
│ 🏨 住宿信息                              │
│ 截止时间：2026-09-08（开会前7天）          │
│                                         │
│ ○ 男单间  （¥450/晚）                    │
│ ○ 男双人间（¥240/晚）                    │
│ ○ 女单间  （¥450/晚）                    │
│ ○ 女双人间（¥240/晚）                    │
│ ○ 自主安排                              │
│                                         │
│ ⚠️ 截止后未提交视为自主安排               │
└─────────────────────────────────────────┘
```
- 选项根据用户性别自动高亮推荐（男用户：男单/男双高亮；女用户：女单/女双高亮）
- 截止时间校验：超过 `accommodationDeadline` 后禁用修改
- 截止后未提交的显示「未提交，已视为自主安排」

#### 模块 C：野外报名

```
┌─────────────────────────────────────────┐
│ 🏔️ 会议野外报名                          │
│ 截止时间：2026-09-08（开会前7天）          │
│                                         │
│ 会前野外路线（可多选）：                   │
│ □ 路线一：XXX 地质剖面考察                │
│ □ 路线二：XXX 化石点采集                  │
│ ...（最多 5 条，由管理员配置）             │
│                                         │
│ 会中野外路线（可多选）：                   │
│ □ 路线一：XXX                            │
│ ...                                      │
│                                         │
│ 会后野外路线（可多选）：                   │
│ □ 路线一：XXX                            │
│ ...                                      │
│                                         │
│ 💰 野外费用由旅游公司收取，不纳入学会会议费  │
│ ⚠️ 截止后未报名视为自行联系旅游公司        │
└─────────────────────────────────────────┘
```
- 多选模式：用户可同时选择会前/会中/会后任意路线
- 路线名称和数量由管理员在后台配置（每场会议最多 15 条）
- 截止时间校验：超过 `fieldTripDeadline` 后禁用修改
- 用户性别自动绑定到报名记录

### 2. MembershipContext.tsx —— 新增状态

```ts
// ConferenceReg 类型扩展
interface ConferenceReg {
  // ... 现有字段
  // 新增摘要字段
  abstractFileUrl?: string;
  abstractFileName?: string;
  abstractSubmitTime?: string;
  
  // 新增住宿字段（替代旧的 accommodation: "单间" | "双人间" | "自行安排"）
  accommodationType?: "male_single" | "male_double" | "female_single" | "female_double" | "self_arranged";
  
  // 新增野外报名字段
  fieldTripSelections?: {
    pre: string[];      // 会前选中的路线 ID
    during: string[];   // 会中选中的路线 ID
    post: string[];     // 会后选中的路线 ID
  };
}

// 新增操作
uploadAbstract(confId: string, file: File): void;
deleteAbstract(confId: string): void;
setAccommodation(confId: string, type: AccommodationType): void;
toggleFieldTripRoute(confId: string, phase: "pre"|"during"|"post", routeId: string): void;
```

---

## 管理后台修改

### 3. ConferenceManagement.tsx —— 配置扩展

- 编辑会议时新增三个截止时间字段：
  - 摘要截止日期（`abstractDeadline`）
  - 住宿截止日期（`accommodationDeadline`）
  - 野外报名截止日期（`fieldTripDeadline`）
- 野外路线配置面板：
  - 动态添加/删除路线
  - 每条路线：所属阶段（会前/会中/会后）、路线名称、序号（1-5）
  - 最多 15 条路线

### 4. AdminContext.tsx —— 数据查询

- `getConferenceRegistrations(confId)` 返回该会议所有报名信息（含摘要/住宿/野外）
- 摘要文件按会议集中查询
- 住宿统计查询（已在 Phase 3 定义结构）
- 野外报名统计查询（已在 Phase 3 定义结构）

---

## 验收标准

- [ ] 用户前台：缴费确认后可提交摘要 Word（.doc/.docx）
- [ ] 用户前台：摘要截止前可自由删除替换，截止后不可修改
- [ ] 用户前台：住宿选项区分男单/男双/女单/女双/自主安排
- [ ] 用户前台：住宿根据用户性别智能推荐
- [ ] 用户前台：野外报名支持会前/会中/会后多选
- [ ] 用户前台：住宿和野外截止后不可修改
- [ ] 管理后台：可配置每场会议的摘要/住宿/野外截止时间
- [ ] 管理后台：可配置每场会议的野外路线（名称和阶段）
- [ ] TypeScript 类型检查通过
- [ ] 构建通过
