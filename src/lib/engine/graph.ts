import type { FlowNode, FlowEdge, ProcessGraph } from "./types";

/** 设计器运行态 → 持久化结构(剥离 xyflow 渲染字段,展平 edge.data) */
export function toGraph(nodes: FlowNode[], edges: FlowEdge[]): ProcessGraph {
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
    edges: edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      condition: e.data?.condition, isDefault: e.data?.isDefault,
    })),
  };
}

/** 持久化结构 → 设计器运行态 */
export function fromGraph(graph: ProcessGraph): { nodes: FlowNode[]; edges: FlowEdge[] } {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id, type: n.type, position: n.position, data: n.data,
    })) as FlowNode[],
    edges: graph.edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      type: "condition",
      data: { condition: e.condition, isDefault: e.isDefault },
    })) as FlowEdge[],
  };
}
