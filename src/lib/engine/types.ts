import type { Node, Edge } from "@xyflow/react";

/** 流程节点类型枚举 —— 设计器、引擎、Prisma graph(Json)统一契约 */
export type NodeType =
  | "startEvent" | "endEvent"
  | "userTask" | "serviceTask"
  | "exclusiveGateway" | "parallelGateway"
  | "subProcess";

export type AssigneeRule = "user" | "role" | "deptLeader" | "starterManager";

/** 节点业务数据(存入 @xyflow Node.data) */
export interface FlowNodeData {
  label: string;
  /** userTask 专属 */
  assignee?: AssigneeRule;
  formKey?: string;
  dueHours?: number;
  /** subProcess 专属 */
  subProcessKey?: string;
  [key: string]: unknown; // 满足 @xyflow Record 约束
}

/** 边业务数据 */
export interface FlowEdgeData {
  /** exclusiveGateway 出边条件,如 "amount > 5000" */
  condition?: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

/** @xyflow 强类型别名 */
export type FlowNode = Node<FlowNodeData, NodeType>;
export type FlowEdge = Edge<FlowEdgeData>;

/** 持久化时剥离运行态字段,只存结构(与 Prisma graph 同构) */
export interface ProcessGraph {
  nodes: Array<Pick<FlowNode, "id" | "type" | "position" | "data">>;
  edges: Array<Pick<FlowEdge, "id" | "source" | "target"> & FlowEdgeData>;
}

export interface ValidationIssue {
  level: "error" | "warning";
  nodeId?: string;
  edgeId?: string;
  message: string;
}
