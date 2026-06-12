# 会员双路径系统设计

## 概述

将当前单一会员路径改为"非会员 / 正式会员"双路径系统。所有用户初始为"普通用户"，首次登录时强制选择路径。非会员可直接绑定分会和注册会议（高价），会员需完成缴费验证后享受低价。

---

## 一、数据模型

### 1.1 用户类型三层身份

```
regular (普通用户，未选择)
  ├── non_member (非会员，路径A)
  └── member (正式会员，路径B)
```

- `regular`: 初始状态，首次登录后强制选择。无法绑定分会或注册会议。
- `non_member`: 选择不成为会员。直接解锁分会绑定和会议报名，会议费按非会员价。
- `member`: 完成缴费+两阶段审核后成为正式会员。会议费按会员价。

### 1.2 localStorage 键

```
paleo_user_type_{email}     → "non_member" | "member"
paleo_choice_made_{email}   → true | false
```

### 1.3 状态映射

现有的 `societyMembership.status` 保留不变（`not_member` → `active` 的两阶段审核流程），仅当 `user_type === "member"` 时该状态才有意义。非会员的 `societyMembership.status` 始终为 `not_member`。

---

## 二、权限模型

| 操作 | regular | non_member | member |
|------|:-:|:-:|:-:|
| 绑定分会 | ✗ | ✓ | ✓ |
| 注册会议 | ✗ | ✓ (非会员价) | ✓ (会员价) |
| 上传摘要 | ✗ | ✓ | ✓ |
| 升级为会员 | — | ✓ | — |

---

## 三、会议双价

### 3.1 定价规则

每个会议有两个价格：`fee_member`(会员价) 和 `fee_non_member`(非会员价)。非会员价在现有价格基础上浮 10%。

### 3.2 展示规则

- **会议卡片（列表视图）**：仅展示与当前用户身份对应的单一价格
- **会议详细通知页**：同时展示会员价和非会员价
- **缴费流程**：根据用户类型自动匹配对应金额

### 3.3 非会员缴费页提示

非会员缴费时显示升级提示："升级为正式会员（¥200/年）后，本次会议可节省 ¥X。"

---

## 四、UI 流程

### 4.1 首次登录决策弹窗

用户首次登录后弹出模态框，无 emoji 图标：

```
┌──────────────────────────────────────────────┐
│  欢迎来到中国古生物学会                       │
│                                              │
│  请选择您的参与方式：                          │
│                                              │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │  成为正式会员     │ │  作为非会员继续   │   │
│  │                  │ │                  │   │
│  │  ¥200/年         │ │  按非会员价参会   │   │
│  │  享受会员价参会   │ │  无需缴费         │   │
│  │  需完成缴费验证   │ │  可直接操作       │   │
│  │                  │ │                  │   │
│  │  [选择此方式]    │ │  [选择此方式]    │   │
│  └──────────────────┘ └──────────────────┘   │
│                                              │
│  选择后可随时在「会员服务」中变更              │
└──────────────────────────────────────────────┘
```

### 4.2 路径 A：选择"非会员"

1. 弹出确认："确定以非会员身份使用？会议注册费将按非会员标准收取。"
2. 确认后：`user_type = "non_member"`，`membership_choice_made = true`
3. 弹窗关闭，直接解锁分支绑定和会议报名
4. 会员服务页显示当前为"非会员"，提供"升级为正式会员"入口

### 4.3 路径 B：选择"成为会员"

1. `user_type = "member"`，`membership_choice_made = true`
2. 自动跳转到会员服务 → 缴费流程（现有4步流程）
3. 完成两阶段审核后 `societyMembership.status = "active"`
4. 解锁分支绑定和会议报名（会员价）

### 4.4 非会员升级

非会员用户可在会员服务页随时点击"升级为正式会员"，走路径 B 的缴费验证流程。升级后自动享受会员价。

---

## 五、Context 变更 (MembershipContext)

### 5.1 新增 state

```typescript
userType: "regular" | "non_member" | "member"
membershipChoiceMade: boolean
```

### 5.2 新增 action

```typescript
chooseMembershipPath(path: "member" | "non_member"): void
```

### 5.3 修改的 action

- `toggleBranchBinding`: 检查条件从 `societyMembership.status` 改为 `userType !== "regular"`
- `submitConferenceVoucher`: 检查条件从会员状态改为 `userType !== "regular"`，金额根据 `userType` 匹配
- `submitConferenceInvoice`: 同上
- `getConferenceFee(confId)`: 新增函数，根据 `userType` 返回会员价或非会员价。`userType` 是稳定身份标识，会员过期后仍按会员价（需续费后才能报名），不降级为非会员价

---

## 六、实现范围

### 修改文件

| 文件 | 变更 |
|------|------|
| `shared/constants.ts` | 新增 `USER_TYPE` 枚举、双价配置、`getConferenceFee` |
| `client/src/contexts/MembershipContext.tsx` | 新增 `userType`/`membershipChoiceMade` state、`chooseMembershipPath`、权限检查改写、会议双价逻辑 |
| `client/src/pages/Services.tsx` | 会议卡价格单显、通知页双价、非会员升级入口、缴费提示 |
| `client/src/pages/PersonalCenter.tsx` | 显示用户类型标签 |
| `client/src/components/PartyLayout.tsx` | 集成首次登录决策弹窗 |

### 新增文件

| 文件 | 用途 |
|------|------|
| `client/src/components/MembershipChoiceDialog.tsx` | 首次登录路径选择弹窗 |

### 不修改文件

- `LoginJoinDialog.tsx` — 决策在登录后，不在此处
- `App.tsx` — Provider 层级不变
