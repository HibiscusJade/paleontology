# Phase 0：前置准备——共享常量更新

> **依赖**：无
> **目标**：两个项目的 `shared/constants.ts` 必须同步修改。Phase 0 是所有后续阶段的基础，必须先完成。

---

## 涉及文件

| 文件 | 项目 |
|------|------|
| `shared/constants.ts` | `paleontology-admin-latest/` |
| `shared/constants.ts` | `paleontology-website-latest/` |

---

## 修改内容

### A. 学会/分会模型——新增总学会

```ts
// 当前 BRANCH_MAP 有 11 个分会，需新增总学会为独立单元
// 总学会 ID: "zgswxh" (中国古生物学会)
// 总学会在展示中始终置顶

const ALL_SOCIETY_UNITS = {
  "zgswxh": "中国古生物学会（总学会）",  // 新增，置顶
  "gwjzdwxfh": "古无脊椎动物学分会",
  // ... 其余 11 个分会保持不变
} as const;

const TOTAL_SOCIETY_ID = "zgswxh";  // 总学会标识常量
const BRANCH_IDS = [/* 11 个分会 ID，不含总学会 */];
```

### B. 四类会议费类型

```ts
// 新增费用类型枚举
const CONFERENCE_FEE_TYPE = {
  STUDENT_MEMBER: "student_member",           // 学生会员
  NON_STUDENT_MEMBER: "non_student_member",   // 非学生会员
  STUDENT_NON_MEMBER: "student_non_member",   // 学生（非会员）
  NON_STUDENT_NON_MEMBER: "non_student_non_member", // 非学生（非会员）
} as const;

const CONFERENCE_FEE_TYPE_LABEL = {
  student_member: "学生会员",
  non_student_member: "非学生会员",
  student_non_member: "学生（非会员）",
  non_student_non_member: "非学生（非会员）",
} as const;
```

### C. 会议费用结构——从单一价格改为四类价格

```ts
// 当前：单场会议只有一个 memberFee 和一个 nonMemberFee
// 修改为四类价格对象
interface ConferenceFeeConfig {
  studentMember: number;           // 学生会员会议费
  nonStudentMember: number;        // 非学生会员会议费
  studentNonMember: number;        // 学生（非会员）会议费
  nonStudentNonMember: number;     // 非学生（非会员）会议费
}

// getConferenceFee 函数签名改为接收 feeType 而非简单的 userType
function getConferenceFee(confId: string, feeType: ConferenceFeeType): number
```

### D. 用户身份扩展

```ts
// 当前 UserType: "regular" | "non_member" | "member"
// 需要新增学生/非学生维度
const USER_IDENTITY = {
  STUDENT: "student",
  NON_STUDENT: "non_student",
} as const;

// 用户完整身份 = userType + isStudent
// 用于确定会议费类型
function deriveFeeType(userType: UserType, isStudent: boolean): ConferenceFeeType
```

### E. 会员状态新增入会审核状态

```ts
// 当前 MEMBERSHIP_STATUS 已有 not_member → voucher_submitted → ... → active → expired
// 新增入会申请审核阶段
// not_member → application_submitted（入会申请书已提交）
//            → application_rejected（入会申请被驳回）
//            → application_approved → voucher_submitted → ...（原流程）
```

### F. 住宿类型枚举

```ts
const ACCOMMODATION_TYPE = {
  MALE_SINGLE: "male_single",       // 男单间
  MALE_DOUBLE: "male_double",       // 男双人间
  FEMALE_SINGLE: "female_single",   // 女单间
  FEMALE_DOUBLE: "female_double",   // 女双人间
  SELF_ARRANGED: "self_arranged",   // 自主安排
} as const;
```

### G. 野外路线结构

```ts
interface FieldTripRoute {
  id: string;
  phase: "pre" | "during" | "post";  // 会前/会中/会后
  name: string;                        // 路线名称
  order: number;                       // 路线序号 1-5
}
```

---

## 验收标准

- [ ] 两个项目的 `shared/constants.ts` 包含上述所有新增常量
- [ ] TypeScript 类型检查通过（`pnpm check`）
- [ ] 旧代码中引用 `CONFERENCE_FEE_MEMBER`、`getConferenceFee` 的地方已标记为需要后续 Phase 更新
