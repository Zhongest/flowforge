"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "@/lib/engine/types";
import { NODE_REGISTRY } from "@/lib/engine/node-registry";

export function GatewayNode({ type, data, selected }: NodeProps<FlowNode>) {
  const def = NODE_REGISTRY[type];
  const Icon = def.icon;
  return (
    <div className="relative" style={{ width: 54, height: 54 }}>
      <div
        className="absolute inset-1.5 rounded-lg bg-[var(--color-bg-raised)]"
        style={{
          transform: "rotate(45deg)",
          border: `2px solid ${def.color}`,
          outline: selected ? `2px solid ${def.color}` : "none",
          outlineOffset: 5,
          boxShadow: "var(--shadow-raised)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <Icon size={16} color={def.color} strokeWidth={2.5} />
      </div>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-ink-mute">
        {data.label}
      </div>
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}
