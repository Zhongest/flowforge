# FlowForge — Phase 0 脚手架

企业级流程管理系统 MVP。当前为**模型 A**(GitHub Pages 静态 + Mock 认证 + 本地存储)。

## 快速开始
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 静态导出至 out/
```

## 部署
推送 main 分支自动触发 `.github/workflows/deploy.yml` → GitHub Pages。
仓库 Settings → Pages → Source 选择 "GitHub Actions"。
若仓库名不是 `flowforge`,修改 `next.config.ts` 中的 `repo` 常量。

## 架构要点
- `src/lib/repository/` — 数据层抽象,Phase 4 切换 ApiRepository 接真实后端
- `src/lib/auth/` — Mock 角色切换器,Phase 4 替换为企业微信 OAuth(Secret 只存后端)
- `src/lib/engine/` — 流程图类型契约,设计器/引擎/后端共用

## 已知限制(模型 A)
数据存于浏览器 localStorage,**不支持多人协作**;演示多角色流转请使用左下角角色切换器。

## Phase 1 — 流程设计器(已实现)
真实 `@xyflow/react` v12 设计器,路由 `/designer`:
- 6 类自定义节点(EventNode / TaskNode / GatewayNode)+ 条件边(ConditionEdge)
- Zustand store(`src/store/designer-store.ts`):撤销/重做历史栈、连线、校验、发布
- 纯函数校验引擎(`src/lib/engine/validate.ts`)+ Vitest 单测(`npm test`,7 用例)
- 拖拽建节点、连线合法性约束、⌘Z/⌘⇧Z、Delete、MiniMap、网格吸附

数据流:设计器(xyflow)→ `toGraph()` → `ProcessGraph`(与 Prisma `graph` Json 同构)→ 校验/持久化。
