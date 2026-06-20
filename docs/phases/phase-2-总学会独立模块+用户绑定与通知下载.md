# Phase 2：总学会独立模块 + 用户绑定与通知下载

> **依赖**：Phase 1 完成
> **目标**：总学会作为独立置顶模块展示，用户可绑定任意学会，缴费后开放盖章通知和摘要模板下载。

---

## 涉及文件

| 文件 | 项目 | 修改类型 |
|------|------|----------|
| `client/src/pages/Services.tsx` | Website | 总学会置顶展示、绑定功能、下载入口 |
| `client/src/pages/Branches.tsx` | Website | 总学会置顶 |
| `client/src/contexts/MembershipContext.tsx` | Website | 绑定逻辑扩展、下载权限控制 |
| `client/src/pages/admin/ConferenceManagement.tsx` | Admin | 总学会会议发布、文件上传 |
| `client/src/contexts/AdminContext.tsx` | Admin | 总学会会议管理、文件上传接口 |

---

## 用户前台修改

### 1. Services.tsx / Branches.tsx —— 总学会置顶

- 在分会列表顶部新增「中国古生物学会（总学会）」卡片
- 总学会卡片使用差异化样式（金色边框、学会徽标）
- 总学会展示自己发布的会议（中国古生物学术年会、重要论坛/活动）
- 分会展示各自学术年会会议
- 「绑定分会」按钮对总学会始终可用（总学会默认绑定）

### 2. 会议通知下载

- 会议详情页增加两个下载区域：
  - **未缴费时**：显示「会议通知（不盖章）」下载按钮，可查看但不盖章
  - **缴费确认后**：解锁两个下载入口
    - 「盖中国古生物学会电子章的会议通知 PDF」
    - 「会议论文摘要模板 Word」
- 下载按钮的显示/隐藏由 `conferenceReg.status === "confirmed"` 控制

### 3. MembershipContext.tsx —— 绑定与下载权限

- 所有注册用户均可绑定任意学会/分会（无门槛）
- 新增 `canDownloadStampedNotice(confId): boolean` 检查缴费状态
- 新增 `canDownloadAbstractTemplate(confId): boolean` 检查缴费状态
- 绑定/解绑操作记录日志

---

## 管理后台修改

### 4. ConferenceManagement.tsx —— 总学会会议 + 文件上传

- 创建会议时「主办学会」下拉包含总学会 + 11 个分会
- 分会管理员只能选择自己所属的分会（总学会管理员不受限）
- 会议编辑表单新增两个文件上传字段：
  - 盖章会议通知 PDF 上传（单文件）
  - 摘要模板 Word 上传（单文件）
- 文件上传采用 `<input type="file">` + FileReader 转 base64 存储到 localStorage

### 5. AdminContext.tsx —— 文件存储

- 新增文件存储结构：
  ```ts
  interface ConferenceFiles {
    stampedNoticeUrl?: string;    // 盖章通知 PDF (base64)
    abstractTemplateUrl?: string; // 摘要模板 Word (base64)
  }
  ```
- 文件与会议绑定，存储在 `paleo_admin_conferences_db` 中
- 新增 `uploadConferenceFile(confId, fileType, file)` 方法

---

## 验收标准

- [ ] 用户前台：总学会在分会列表顶部置顶，样式与其他分会区分
- [ ] 用户前台：总学会只展示总学会发布的会议/活动
- [ ] 用户前台：所有注册用户均可绑定任意学会/分会
- [ ] 用户前台：未缴费时只能查看不盖章通知
- [ ] 用户前台：缴费确认后可下载盖章通知 PDF 和摘要模板 Word
- [ ] 管理后台：可创建归属总学会的会议
- [ ] 管理后台：可上传盖章通知 PDF 和摘要模板 Word
- [ ] TypeScript 类型检查通过
- [ ] 构建通过
