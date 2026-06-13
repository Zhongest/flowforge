"use client";
import { useReactFlow } from "@xyflow/react";
import {
  Workflow, ChevronRight, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  ShieldCheck, Save, Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useDesignerStore } from "@/store/designer-store";
import { toGraph } from "@/lib/engine/graph";
import { LocalStorageRepository } from "@/lib/repository/local-storage";

const repo = new LocalStorageRepository();

export function Toolbar() {
  const { procName, setProcName, version, status, undo, redo, past, future, validate, publish } =
    useDesignerStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const onValidate = () => {
    const issues = validate();
    if (issues.length === 0) toast.success("校验通过,流程结构合法");
    else toast.warning(`${issues.filter((i) => i.level === "error").length} 个错误待修复`);
  };

  const onSave = async () => {
    const { nodes, edges } = useDesignerStore.getState();
    try {
      // Phase 4 切换 ApiRepository 后此调用走后端,代码不变
      // await repo.saveDraft(defId, toGraph(nodes, edges));
      void toGraph(nodes, edges);
      void repo;
      toast.success(`草稿已保存 · v${version}`);
    } catch (e) {
      toast.error(`保存失败:${(e as Error).message}`);
    }
  };

  const onPublish = () => {
    const { ok, issues } = publish();
    if (ok) toast.success(`已发布 v${version},运行中实例不受后续编辑影响`);
    else toast.error(`存在 ${issues.filter((i) => i.level === "error").length} 个阻断性错误,无法发布`);
  };

  const iconBtn = "grid size-[26px] place-items-center rounded-[5px] text-ink-mute transition-colors hover:bg-bg-hover hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";
  const ghost = "flex items-center gap-1.5 rounded-[7px] border border-line bg-bg-raised px-2.5 py-1.5 text-[12.5px] text-ink transition-colors hover:border-line-strong";

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line-soft bg-bg-surface px-3.5">
      <div className="flex items-center gap-2">
        <span className="grid size-[26px] place-items-center rounded-[6px] bg-accent/15">
          <Workflow size={14} className="text-accent" />
        </span>
        <span className="text-[13px] font-semibold tracking-tight">FlowForge</span>
        <ChevronRight size={13} className="text-ink-faint" />
      </div>

      <input
        aria-label="流程名称"
        value={procName}
        onChange={(e) => setProcName(e.target.value)}
        className="w-[170px] rounded-[6px] border border-transparent bg-transparent px-2 py-1.5 text-[13px] font-medium outline-none focus:border-accent"
      />
      <span
        className="rounded-full px-2 py-[3px] font-mono text-[11px]"
        style={{
          background: status === "已发布" ? "rgba(63,182,139,0.12)" : "rgba(229,164,69,0.12)",
          color: status === "已发布" ? "var(--color-success)" : "var(--color-warn)",
        }}
      >
        v{version} · {status}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 rounded-[7px] border border-line-soft bg-bg-raised p-0.5">
        <button className={iconBtn} onClick={undo} disabled={past.length === 0} title="撤销 (⌘Z)" aria-label="撤销"><Undo2 size={14} /></button>
        <button className={iconBtn} onClick={redo} disabled={future.length === 0} title="重做 (⌘⇧Z)" aria-label="重做"><Redo2 size={14} /></button>
      </div>

      <div className="flex items-center gap-0.5 rounded-[7px] border border-line-soft bg-bg-raised p-0.5">
        <button className={iconBtn} onClick={() => zoomOut()} title="缩小" aria-label="缩小"><ZoomOut size={14} /></button>
        <button className={iconBtn} onClick={() => fitView({ duration: 300, padding: 0.2 })} title="适应视图" aria-label="适应视图"><Maximize2 size={14} /></button>
        <button className={iconBtn} onClick={() => zoomIn()} title="放大" aria-label="放大"><ZoomIn size={14} /></button>
      </div>

      <button className={ghost} onClick={onValidate}><ShieldCheck size={14} /> 校验</button>
      <button className={ghost} onClick={onSave}><Save size={14} /> 保存草稿</button>
      <button
        className="flex items-center gap-1.5 rounded-[7px] border border-accent bg-accent px-2.5 py-1.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
        onClick={onPublish}
      >
        <Rocket size={14} /> 发布
      </button>
    </header>
  );
}
