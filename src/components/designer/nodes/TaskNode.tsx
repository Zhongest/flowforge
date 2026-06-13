"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "@/lib/engine/types";
import { NODE_REGISTRY, ASSIGNEE_RULES } from "@/lib/engine/node-registry";

export function TaskNode({ type, data, selected }: NodeProps<FlowNode>) {
  const def = NODE_REGISTRY[type];
  const Icon = def.icon;
  const isSub = type === "subProcess";

  const subtitle =
    type === "userTask"
      ? ASSIGNEE_RULES.find((r) => r.value === data.assignee)?.label ?? "未配置处理人"
      : type === "serviceTask"
      ? "系统自动执行"
      : isSub
      ? (data.subProcessKey ? String(data.subProcessKey) : "未绑定子流程")
      : "";

  return (
    <div
      className="relative flex h-[62px] w-[184px] items-center gap-2.5 overflow-hidden rounded-[10px] px-3"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01)), var(--color-bg-raised)",
        border: isSub
          ? "1.5px dashed var(--color-line-strong)"
          : "1px solid var(--color-line)",
        outline: selected ? `2px solid ${def.color}` : "none",
        outlineOffset: 3,
        boxShadow: "var(--shadow-raised)",
      }}
    >
      <span
        className="absolute left-0 bottom-2 top-2 w-[3px] rounded-sm"
        style={{ background: isSub ? "var(--color-accent)" : def.color }}
      />
      <span
        className="grid size-[30px] shrink-0 place-items-center rounded-[7px]"
        style={{ background: `${def.color}1f` }}
      >
        <Icon size={15} color={def.color} />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-ink">{data.label}</div>
        <div className="truncate text-[11px] text-ink-faint">{subtitle}</div>
      </div>
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}
