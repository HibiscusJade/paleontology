# Phase 2 实施摘要：总学会独立模块 + 用户绑定与通知下载

> **日期**：2026-06-21
> **状态**：✅ 已完成
> **依赖**：Phase 1

---

## 涉及文件

| 文件 | 项目 | 修改类型 | 说明 |
|------|------|----------|------|
| `client/src/contexts/MembershipContext.tsx` | Website | 修改 | 下载权限收紧、绑定无门槛化、新增会议映射 |
| `client/src/pages/Services.tsx` | Website | 修改 | 新增 2 场总学会会议、绑定按钮全用户开放 |
| `shared/constants.ts` | Website | 修改 | 新增总学会会议的分会映射与费用配置 |
| `shared/constants.ts` | Admin | 修改 | 同步 Website 的常量变更 |

---

## 用户前台修改

### 1. 分会绑定无门槛化

**修改前**：`toggleBranchBinding()` 对 `userType === "regular"` 用户直接拒绝（提示"请先选择参与方式"），对 `member` 用户要求完成缴费验证。

**修改后**：移除所有前置条件，所有已登录用户均可自由绑定/解绑任意学会/分会。Services.tsx 中绑定按钮同步从条件渲染改为仅判断 `isLoggedIn`。

- 涉及位置：`MembershipContext.tsx` `toggleBranchBinding()`（行 561）、`Services.tsx` 绑定按钮（行 1029）

### 2. 下载权限收紧

`canDownloadStampedNotice()` 和 `canDownloadAbstractTemplate()` 原来在 `invoice_pending`（凭证初审通过）阶段即返回 `true`，不符合"缴费确认后解锁"的要求。

**修改为**：仅当 `conferenceReg.status === "confirmed"`（或兼容旧状态 `approved_invoice` / `active`）时才允许下载盖章通知和摘要模板。

- 涉及位置：`MembershipContext.tsx`（行 1297–1315）

### 3. 总学会会议数据

Services.tsx 硬编码会议列表中新增 2 场总学会（`branchId = "zgswxh"`）会议：

| 会议 ID | 名称 | 时间 | 地点 | 会员价 |
|---------|------|------|------|--------|
| `conf-zgswxh-1` | 中国古生物学会第32届学术年会 | 2026.10.15–19 | 南京 | ¥1500 |
| `conf-zgswxh-2` | 中国古生物学会国际古生物学前沿论坛 | 2027.04.10–13 | 北京 | ¥2000 |

同步更新了 `getConferenceTitle()`、`getConferenceBranchId()`、`getConferenceFee()` 三个辅助函数，以及两份 `shared/constants.ts` 中的 `CONFERENCE_BRANCH_MAP` 和 `CONFERENCE_FEE_MEMBER`。

---

## 管理后台修改

管理后台在 Phase 2 之前已完成大部分基础工作，本次无需额外修改：

- `ALL_SOCIETY_UNITS` 下拉已包含总学会（`zgswxh`），创建会议时可选择
- `ConferenceManagement.tsx` 文件上传 UI 已实现（盖章通知 PDF + 摘要模板 Word）
- `ConferenceRecord` / `ConferenceData` 接口已包含 `stampedNoticeUrl` / `abstractTemplateUrl` 字段

---

## 验收标准

- [x] 用户前台：总学会在分会列表顶部置顶，样式与其他分会区分
- [x] 用户前台：总学会只展示总学会发布的会议/活动
- [x] 用户前台：所有注册用户均可绑定任意学会/分会
- [x] 用户前台：未缴费时只能查看不盖章通知
- [x] 用户前台：缴费确认后可下载盖章通知 PDF 和摘要模板 Word
- [x] 管理后台：可创建归属总学会的会议
- [x] 管理后台：可上传盖章通知 PDF 和摘要模板 Word
- [x] TypeScript 类型检查通过
- [x] 构建通过

---

## 已知局限

1. **localStorage 跨域**：前端通过 `paleo_admin_conferences_db` 读取管理员上传的文件，开发环境不同端口无法共享；同源部署正常工作。文件不存在时降级显示"管理员尚未上传"。
2. **base64 存储**：盖章通知 PDF 和摘要模板 Word 以 base64 存入 localStorage，大文件可能超限。
3. **会议列表分散**：Website 前端的会议列表（Services.tsx 硬编码）与 Admin 后台的会议列表（`paleo_admin_conferences_db`）相互独立，后续迭代可考虑统一数据源。
