"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "@/lib/engine/types";
import { NODE_REGISTRY } from "@/lib/engine/node-registry";

export function EventNode({ id, type, data, selected }: NodeProps<FlowNode>) {
  const def = NODE_REGISTRY[type];
  const Icon = def.icon;
  const isEnd = type === "endEvent";
  return (
    <div className="relative grid place-items-center" style={{ width: 48, height: 48 }}>
      <div
        className="grid size-12 place-items-center rounded-full bg-[var(--color-bg-raised)]"
        style={{
          border: `2px solid ${def.color}`,
          outline: selected ? `2px solid ${def.color}` : "none",
          outlineOffset: 3,
          boxShadow: "var(--shadow-raised)",
        }}
      >
        <Icon size={16} color={def.color} fill={isEnd ? def.color : "none"} />
      </div>
      <div className="absolute top-full mt-1.5 whitespace-nowrap text-[11px] text-ink-mute">
        {data.label}
      </div>
      {def.allowIn && <Handle type="target" position={Position.Left} className="ff-handle" />}
      {def.allowOut && <Handle type="source" position={Position.Right} className="ff-handle" />}
    </div>
  );
}
