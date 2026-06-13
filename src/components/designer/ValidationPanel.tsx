"use client";
import { AlertTriangle } from "lucide-react";
import { useDesignerStore } from "@/store/designer-store";

export function ValidationPanel() {
  const { issues, select } = useDesignerStore();
  if (!issues || issues.length === 0) return null;
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warning").length;

  return (
    <div className="absolute bottom-3.5 left-3.5 z-10 max-h-[220px] w-[320px] overflow-y-auto rounded-[10px] border border-line bg-bg-raised p-2.5 shadow-[var(--shadow-raised)]">
      <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold">
        <AlertTriangle size={13} style={{ color: errors ? "var(--color-danger)" : "var(--color-warn)" }} />
        {errors} 个错误 · {warnings} 个警告
      </p>
      {issues.map((i, idx) => (
        <button
          key={idx}
          onClick={() => i.nodeId && select({ kind: "node", id: i.nodeId })}
          className="flex w-full items-start gap-1.5 rounded-[6px] px-1 py-[5px] text-left text-[12px] text-ink-mute hover:bg-bg-hover"
          style={{ cursor: i.nodeId ? "pointer" : "default" }}
        >
          <span className="mt-[5px] size-1.5 shrink-0 rounded-full"
            style={{ background: i.level === "error" ? "var(--color-danger)" : "var(--color-warn)" }} />
          {i.message}
        </button>
      ))}
    </div>
  );
}
