import { Play, Square, User, Cog, X, Plus, Boxes, type LucideIcon } from "lucide-react";
import type { NodeType } from "./types";

export interface NodeDef {
  label: string;
  shape: "circle" | "diamond" | "card" | "sub";
  color: string;
  icon: LucideIcon;
  group: "事件" | "任务" | "网关" | "结构";
  /** 入/出连接点数量约束,用于连线合法性 */
  allowIn: boolean;
  allowOut: boolean;
}

export const NODE_REGISTRY: Record<NodeType, NodeDef> = {
  startEvent:       { label: "开始事件", shape: "circle",  color: "#3FB68B", icon: Play,  group: "事件", allowIn: false, allowOut: true },
  endEvent:         { label: "结束事件", shape: "circle",  color: "#E5484D", icon: Square,group: "事件", allowIn: true,  allowOut: false },
  userTask:         { label: "用户任务", shape: "card",    color: "#5B8DEF", icon: User,  group: "任务", allowIn: true,  allowOut: true },
  serviceTask:      { label: "服务任务", shape: "card",    color: "#9A7BF0", icon: Cog,   group: "任务", allowIn: true,  allowOut: true },
  exclusiveGateway: { label: "排他网关", shape: "diamond", color: "#E5A445", icon: X,     group: "网关", allowIn: true,  allowOut: true },
  parallelGateway:  { label: "并行网关", shape: "diamond", color: "#38B2C4", icon: Plus,  group: "网关", allowIn: true,  allowOut: true },
  subProcess:       { label: "子流程",   shape: "sub",     color: "#9AA1AD", icon: Boxes, group: "结构", allowIn: true,  allowOut: true },
};

export const PALETTE_GROUPS = ["事件", "任务", "网关", "结构"] as const;

export const ASSIGNEE_RULES = [
  { value: "user",           label: "指定成员" },
  { value: "role",           label: "按角色池" },
  { value: "deptLeader",     label: "发起人部门主管" },
  { value: "starterManager", label: "发起人上级" },
] as const;

/** Phase 2 接表单设计器后改为动态加载 */
export const MOCK_FORMS = [
  { key: "expense-form",  name: "报销申请单" },
  { key: "leave-form",    name: "请假申请单" },
  { key: "purchase-form", name: "采购申请单" },
];
