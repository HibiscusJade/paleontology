# 中国古生物学会网站——前后端修改计划（分阶段执行）

> **制定日期**：2026-06-20
> **依据 MRD**：`docs/2026-06-17-客户新增修改内容-MRD.md`
> **依据 PRD**：`agentic/01-prd/2026-06-18-确定需求实现清单-PRD.md`
> **涉及项目**：`paleontology-admin-latest/`（管理后台）、`paleontology-website-latest/`（用户前台）

---

## 阶段总览

| 阶段 | 文档 | 目标 | 依赖 |
|------|------|------|------|
| Phase 0 | [phase-0-共享常量更新.md](./phase-0-%E5%85%B1%E4%BA%AB%E5%B8%B8%E9%87%8F%E6%9B%B4%E6%96%B0.md) | 共享常量更新（所有阶段基础） | 无 |
| Phase 1 | [phase-1-四类会议费+分会权限隔离.md](./phase-1-%E5%9B%9B%E7%B1%BB%E4%BC%9A%E8%AE%AE%E8%B4%B9%2B%E5%88%86%E4%BC%9A%E6%9D%83%E9%99%90%E9%9A%94%E7%A6%BB.md) | 四类会议费 + 分会权限隔离 | Phase 0 |
| Phase 2 | [phase-2-总学会独立模块+用户绑定与通知下载.md](./phase-2-%E6%80%BB%E5%AD%A6%E4%BC%9A%E7%8B%AC%E7%AB%8B%E6%A8%A1%E5%9D%97%2B%E7%94%A8%E6%88%B7%E7%BB%91%E5%AE%9A%E4%B8%8E%E9%80%9A%E7%9F%A5%E4%B8%8B%E8%BD%BD.md) | 总学会独立模块 + 用户绑定与通知下载 | Phase 1 |
| Phase 3 | [phase-3-后台三层统计.md](./phase-3-%E5%90%8E%E5%8F%B0%E4%B8%89%E5%B1%82%E7%BB%9F%E8%AE%A1.md) | 后台三层统计 | Phase 1, 2 |
| Phase 4 | [phase-4-摘要提交+住宿信息+野外报名.md](./phase-4-%E6%91%98%E8%A6%81%E6%8F%90%E4%BA%A4%2B%E4%BD%8F%E5%AE%BF%E4%BF%A1%E6%81%AF%2B%E9%87%8E%E5%A4%96%E6%8A%A5%E5%90%8D.md) | 摘要提交 + 住宿信息 + 野外报名 | Phase 1 |
| Phase 5 | [phase-5-参会信息后台汇总+凭证发票绑定+分类导出.md](./phase-5-%E5%8F%82%E4%BC%9A%E4%BF%A1%E6%81%AF%E5%90%8E%E5%8F%B0%E6%B1%87%E6%80%BB%2B%E5%87%AD%E8%AF%81%E5%8F%91%E7%A5%A8%E7%BB%91%E5%AE%9A%2B%E5%88%86%E7%B1%BB%E5%AF%BC%E5%87%BA.md) | 参会信息后台汇总 + 凭证发票绑定 + 分类导出 | Phase 3, 4 |
| Phase 6 | [phase-6-入会审核+退会机制.md](./phase-6-%E5%85%A5%E4%BC%9A%E5%AE%A1%E6%A0%B8%2B%E9%80%80%E4%BC%9A%E6%9C%BA%E5%88%B6.md) | 入会审核 + 退会机制 | Phase 1 |

---

## 依赖关系图

```
Phase 0 (共享常量)
    │
    ▼
Phase 1 (四类会议费 + 权限隔离)
    │
    ├──────────┬──────────────┐
    ▼          ▼              ▼
Phase 2    Phase 4         Phase 6
(总学会+    (摘要+住宿+     (入会+退会)
 通知下载)   野外报名)
    │          │              │
    ▼          ▼              │
Phase 3    ──────────────────┘
(三层统计)     │
    │          │
    ▼          ▼
Phase 5 (参会汇总 + 凭证发票 + 导出)
```

---

## 文件修改总览

### 管理后台（paleontology-admin-latest）

| 文件 | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|------|---------|---------|---------|---------|---------|---------|---------|
| `shared/constants.ts` | ✅ 重写 | — | — | — | — | — | — |
| `client/src/contexts/AdminContext.tsx` | — | ✅ 重写 | ✅ 扩展 | ✅ 扩展 | ✅ 扩展 | ✅ 扩展 | ✅ 扩展 |
| `client/src/components/AdminSidebar.tsx` | — | ✅ 修改 | — | — | — | — | — |
| `client/src/components/AdminLayout.tsx` | — | ✅ 修改 | — | — | — | — | — |
| `client/src/pages/admin/Dashboard.tsx` | — | — | — | ✅ 重写 | — | — | — |
| `client/src/pages/admin/Statistics.tsx` | — | — | — | ✅ 重写 | ✅ 扩展 | ✅ 扩展 | — |
| `client/src/pages/admin/ConferenceManagement.tsx` | — | ✅ 修改 | ✅ 修改 | — | ✅ 扩展 | — | ✅ 扩展 |
| `client/src/pages/admin/FinanceRecords.tsx` | — | — | — | — | — | ✅ 重写 | — |
| `client/src/pages/admin/AuditWorkbench.tsx` | — | — | — | — | — | — | ✅ 扩展 |
| `client/src/pages/admin/MemberManagement.tsx` | — | — | — | — | — | — | ✅ 修改 |

### 用户前台（paleontology-website-latest）

| 文件 | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|------|---------|---------|---------|---------|---------|---------|---------|
| `shared/constants.ts` | ✅ 重写 | — | — | — | — | — | — |
| `client/src/contexts/MembershipContext.tsx` | — | ✅ 重写 | ✅ 扩展 | — | ✅ 扩展 | ✅ 扩展 | ✅ 扩展 |
| `client/src/pages/Services.tsx` | — | ✅ 修改 | ✅ 修改 | — | ✅ 重写 | — | ✅ 修改 |
| `client/src/pages/Branches.tsx` | — | — | ✅ 修改 | — | — | — | — |
| `client/src/pages/PersonalCenter.tsx` | — | — | — | — | — | ✅ 扩展 | ✅ 扩展 |

---

## 关键技术决策

| 决策点 | 方案 |
|--------|------|
| 数据持久化 | 保持 localStorage 模式（`paleo_*` / `paleo_admin_*` 前缀），无后端 |
| 文件存储 | 使用 FileReader → base64 存储在 localStorage 中 |
| 文件上传 | 使用原生 `<input type="file">` + FileReader API |
| ZIP 导出 | 引入 `jszip` 库生成压缩包 |
| 图表 | 沿用 `recharts`（已安装） |
| UI 组件 | 沿用 `shadcn/ui` (New York style) + `lucide-react` 图标 |
| 表单验证 | 沿用 `react-hook-form` + `zod` |
| 路由 | 沿用 `wouter`，支持 hash routing |
| 样式 | 沿用 Tailwind CSS 4 + 设计系统 CSS 变量 |

---

## 新增 npm 依赖

| 包名 | 用途 | 引入阶段 |
|------|------|----------|
| `jszip` | ZIP 压缩包生成 | Phase 5 |
| `file-saver` | 浏览器端文件下载（配合 jszip） | Phase 5 |

---

## 实施注意事项

1. **每完成一个 Phase**，执行 `pnpm check && pnpm build` 确保无类型错误和构建失败。
2. **Phase 0 必须先完成**，因为所有后续阶段都依赖新的常量定义。
3. **Phase 1 和 Phase 4 可以由不同开发者并行开发**（Phase 4 只依赖 Phase 1，不依赖 Phase 2/3）。
4. **Phase 6 可与 Phase 2/3/4/5 并行开发**（仅依赖 Phase 1）。
5. **每个文件在每个 Phase 只修改一次**，避免交叉修改冲突。
6. **种子数据更新**：每次修改 AdminContext 种子数据时，需要清除 localStorage 或使用新的数据键。
7. **两个项目的 `shared/constants.ts` 必须保持同步**。
