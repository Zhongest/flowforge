import type { ProcessGraph, ValidationIssue } from "./types";

/**
 * 流程图合法性校验(US-2.4)。
 * 纯函数,输入 ProcessGraph(持久化结构),不依赖 @xyflow —— 因此可在
 * 浏览器(设计器)与服务端(Phase 4 发布接口)复用同一份实现。
 */
export function validateGraph(graph: ProcessGraph): ValidationIssue[] {
  const { nodes, edges } = graph;
  const issues: ValidationIssue[] = [];
  const ids = new Set(nodes.map((n) => n.id));

  const starts = nodes.filter((n) => n.type === "startEvent");
  const ends = nodes.filter((n) => n.type === "endEvent");
  if (starts.length === 0) issues.push({ level: "error", message: "流程缺少开始事件" });
  if (starts.length > 1) issues.push({ level: "warning", message: "存在多个开始事件,引擎将从首个进入" });
  if (ends.length === 0) issues.push({ level: "error", message: "流程缺少结束事件" });

  const inCount = new Map<string, number>();
  const outCount = new Map<string, number>();
  for (const e of edges) {
    outCount.set(e.source, (outCount.get(e.source) ?? 0) + 1);
    inCount.set(e.target, (inCount.get(e.target) ?? 0) + 1);
  }

  for (const n of nodes) {
    const ins = inCount.get(n.id) ?? 0;
    const outs = outCount.get(n.id) ?? 0;
    const name = n.data.label;

    if (n.type === "startEvent" && outs === 0)
      issues.push({ level: "error", nodeId: n.id, message: `「${name}」没有出口连线` });
    if (n.type === "endEvent" && ins === 0)
      issues.push({ level: "error", nodeId: n.id, message: `「${name}」没有入口连线` });

    if (n.type !== "startEvent" && n.type !== "endEvent") {
      if (ins === 0) issues.push({ level: "error", nodeId: n.id, message: `「${name}」是孤立节点(无入口)` });
      if (outs === 0) issues.push({ level: "error", nodeId: n.id, message: `「${name}」没有出口,流程会卡死` });
    }

    if (n.type === "userTask") {
      if (!n.data.assignee) issues.push({ level: "warning", nodeId: n.id, message: `「${name}」未配置处理人规则` });
      if (!n.data.formKey) issues.push({ level: "warning", nodeId: n.id, message: `「${name}」未关联表单` });
    }
  }

  // 排他网关:多出边需条件或默认兜底
  for (const g of nodes.filter((n) => n.type === "exclusiveGateway")) {
    const outs = edges.filter((e) => e.source === g.id);
    if (outs.length <= 1) continue;
    const bare = outs.filter((e) => !e.condition?.trim() && !e.isDefault);
    if (bare.length > 0)
      issues.push({
        level: "error", nodeId: g.id, edgeId: bare[0]!.id,
        message: `「${g.data.label}」有 ${bare.length} 条出边缺少条件表达式(或设为默认分支)`,
      });
    if (!outs.some((e) => e.isDefault))
      issues.push({
        level: "warning", nodeId: g.id,
        message: `「${g.data.label}」建议设置默认分支,避免条件全不命中时流程中断`,
      });
  }

  // 从开始事件 BFS 可达性
  if (starts.length > 0) {
    const adj = new Map<string, string[]>();
    for (const e of edges) adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
    const seen = new Set(starts.map((s) => s.id));
    const queue = [...seen];
    while (queue.length) {
      const cur = queue.shift()!;
      for (const nx of adj.get(cur) ?? []) if (!seen.has(nx)) { seen.add(nx); queue.push(nx); }
    }
    for (const n of nodes) {
      if (!seen.has(n.id) && ids.has(n.id))
        issues.push({ level: "error", nodeId: n.id, message: `「${n.data.label}」从开始事件不可达` });
    }
  }

  return issues;
}

export const hasBlockingError = (issues: ValidationIssue[]): boolean =>
  issues.some((i) => i.level === "error");
