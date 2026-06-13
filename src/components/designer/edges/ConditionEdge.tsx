"use client";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { FlowEdge } from "@/lib/engine/types";

export function ConditionEdge(props: EdgeProps<FlowEdge>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected } = props;
  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  const isDefault = !!data?.isDefault;
  const text = isDefault ? "默认" : data?.condition;

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{
          stroke: selected ? "var(--color-accent)" : "rgba(255,255,255,0.22)",
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: isDefault ? "5 4" : undefined,
        }}
      />
      {text && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10.5px]"
            style={{
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              background: "var(--color-bg-raised)",
              border: `1px solid ${isDefault ? "var(--color-line-strong)" : "rgba(229,164,69,0.4)"}`,
              color: isDefault ? "var(--color-ink-mute)" : "var(--color-warn)",
              fontFamily: "var(--font-mono)",
              pointerEvents: "all",
            }}
          >
            {text}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
