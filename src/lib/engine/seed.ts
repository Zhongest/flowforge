import type { FlowNode, FlowEdge } from "./types";

export const SEED_NODES: FlowNode[] = [
  { id: "n1", type: "startEvent",       position: { x: 40,  y: 200 }, data: { label: "发起报销" } },
  { id: "n2", type: "userTask",         position: { x: 170, y: 188 }, data: { label: "填写报销单", assignee: "user", formKey: "expense-form", dueHours: 24 } },
  { id: "n3", type: "exclusiveGateway", position: { x: 430, y: 196 }, data: { label: "金额判断" } },
  { id: "n4", type: "userTask",         position: { x: 570, y: 70  }, data: { label: "总监审批",   assignee: "deptLeader", formKey: "expense-form", dueHours: 48 } },
  { id: "n5", type: "serviceTask",      position: { x: 570, y: 310 }, data: { label: "财务自动打款" } },
  { id: "n6", type: "endEvent",         position: { x: 840, y: 204 }, data: { label: "报销完成" } },
];

export const SEED_EDGES: FlowEdge[] = [
  { id: "e1", source: "n1", target: "n2", type: "condition", data: {} },
  { id: "e2", source: "n2", target: "n3", type: "condition", data: {} },
  { id: "e3", source: "n3", target: "n4", type: "condition", data: { condition: "amount > 5000" } },
  { id: "e4", source: "n3", target: "n5", type: "condition", data: { isDefault: true } },
  { id: "e5", source: "n4", target: "n5", type: "condition", data: {} },
  { id: "e6", source: "n5", target: "n6", type: "condition", data: {} },
];
