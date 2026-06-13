"use client";
import { MousePointer2 } from "lucide-react";
import { NODE_REGISTRY, PALETTE_GROUPS } from "@/lib/engine/node-registry";
import type { NodeType } from "@/lib/engine/types";

export function NodePalette() {
  const entries = Object.entries(NODE_REGISTRY) as [NodeType, (typeof NODE_REGISTRY)[NodeType]][];
  return (
    <aside className="w-[168px] shrink-0 overflow-y-auto border-r border-line-soft bg-bg-surface p-3">
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
        <MousePointer2 size={11} /> 拖入画布以添加
      </p>
      {PALETTE_GROUPS.map((g) => (
        <div key={g} className="mb-3.5">
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-faint">{g}</p>
          {entries.filter(([, d]) => d.group === g).map(([type, d]) => {
            const Icon = d.icon;
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/flowforge", type);
                  e.dataTransfer.effectAllowed = "move";
                }}
                title={`拖拽「${d.label}」到画布`}
                className="mb-1 flex cursor-grab items-center gap-2 rounded-[7px] border border-line-soft bg-bg-raised px-2.5 py-[7px] transition-all hover:-translate-y-px hover:border-line-strong"
              >
                <span className="grid size-[22px] shrink-0 place-items-center rounded-[5px]"
                  style={{ background: `${d.color}1f` }}>
                  <Icon size={12} color={d.color} />
                </span>
                <span className="text-[12px] text-ink-mute">{d.label}</span>
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
