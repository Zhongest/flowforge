"use client";
import { Trash2 } from "lucide-react";
import { useDesignerStore } from "@/store/designer-store";
import { NODE_REGISTRY, ASSIGNEE_RULES, MOCK_FORMS } from "@/lib/engine/node-registry";
import type { AssigneeRule } from "@/lib/engine/types";

const input =
  "w-full box-border rounded-[6px] border border-line bg-bg-raised px-2.5 py-[7px] text-[12.5px] text-ink outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] text-ink-faint">{label}</label>
      {children}
    </div>
  );
}

export function PropertyPanel() {
  const { nodes, edges, selection, updateNodeData, updateEdgeData, deleteSelected } = useDesignerStore();

  const selNode = selection?.kind === "node" ? nodes.find((n) => n.id === selection.id) : null;
  const selEdge = selection?.kind === "edge" ? edges.find((e) => e.id === selection.id) : null;

  const delBtn = (
    <button
      onClick={deleteSelected}
      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[7px] border px-2.5 py-1.5 text-[12.5px]"
      style={{ color: "var(--color-danger)", borderColor: "rgba(229,72,77,0.27)", background: "rgba(229,72,77,0.06)" }}
    >
      <Trash2 size={13} /> {selNode ? "删除节点" : "删除连线"}
    </button>
  );

  return (
    <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-line-soft bg-bg-surface p-3.5">
      {selNode ? (
        (() => {
          const def = NODE_REGISTRY[selNode.type];
          const Icon = def.icon;
          return (
            <div>
              <p className="mb-3.5 flex items-center gap-1.5 text-[12px] font-semibold">
                <span className="grid size-[22px] place-items-center rounded-[5px]" style={{ background: `${def.color}1f` }}>
                  <Icon size={12} color={def.color} />
                </span>
                {def.label}
                <code className="ml-auto font-mono text-[10px] text-ink-faint">{selNode.id}</code>
              </p>

              <Field label="节点名称">
                <input className={input} value={selNode.data.label}
                  onChange={(e) => updateNodeData(selNode.id, { label: e.target.value })} />
              </Field>

              {selNode.type === "userTask" && (
                <>
                  <Field label="处理人规则">
                    <select className={input} value={selNode.data.assignee ?? ""}
                      onChange={(e) => updateNodeData(selNode.id, { assignee: (e.target.value || undefined) as AssigneeRule | undefined })}>
                      <option value="">— 未配置 —</option>
                      {ASSIGNEE_RULES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </Field>
                  <Field label="关联表单">
                    <select className={input} value={selNode.data.formKey ?? ""}
                      onChange={(e) => updateNodeData(selNode.id, { formKey: e.target.value || undefined })}>
                      <option value="">— 未关联 —</option>
                      {MOCK_FORMS.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
                    </select>
                  </Field>
                  <Field label="处理时限(小时)">
                    <input className={input} type="number" min={1} placeholder="超时将标红并提醒"
                      value={selNode.data.dueHours ?? ""}
                      onChange={(e) => updateNodeData(selNode.id, { dueHours: e.target.value ? Number(e.target.value) : undefined })} />
                  </Field>
                </>
              )}

              {selNode.type === "exclusiveGateway" && (
                <div className="rounded-[8px] border p-2.5 text-[12px] leading-relaxed text-ink-mute"
                  style={{ background: "rgba(229,164,69,0.06)", borderColor: "rgba(229,164,69,0.2)" }}>
                  当前 {edges.filter((e) => e.source === selNode.id).length} 条出边。点击每条出边配置条件表达式,例如{" "}
                  <code className="font-mono text-warn">amount &gt; 5000</code>;建议保留默认分支兜底。
                </div>
              )}

              {selNode.type === "parallelGateway" && (
                <div className="rounded-[8px] border border-line-soft bg-bg-raised p-2.5 text-[12px] leading-relaxed text-ink-faint">
                  并行网关:所有出边同时激活;成对使用第二个并行网关汇聚后再继续。
                </div>
              )}

              {selNode.type === "subProcess" && (
                <Field label="绑定子流程">
                  <select className={input} value={selNode.data.subProcessKey ?? ""}
                    onChange={(e) => updateNodeData(selNode.id, { subProcessKey: e.target.value || undefined })}>
                    <option value="">— 未绑定 —</option>
                    <option value="contract-review">合同评审流程</option>
                    <option value="vendor-onboard">供应商准入流程</option>
                  </select>
                </Field>
              )}

              {delBtn}
            </div>
          );
        })()
      ) : selEdge ? (
        (() => {
          const src = nodes.find((n) => n.id === selEdge.source);
          const tgt = nodes.find((n) => n.id === selEdge.target);
          const fromGateway = src?.type === "exclusiveGateway";
          const d = selEdge.data ?? {};
          return (
            <div>
              <p className="mb-3.5 text-[12px] font-semibold">连线属性</p>
              <Field label="路径">
                <span className="text-[12.5px] text-ink-mute">
                  {src?.data.label} <span className="text-ink-faint">→</span> {tgt?.data.label}
                </span>
              </Field>
              {fromGateway ? (
                <>
                  <Field label="条件表达式">
                    <input className={`${input} font-mono`} disabled={!!d.isDefault}
                      placeholder="amount > 5000 && dept == 'FIN'" value={d.condition ?? ""}
                      onChange={(e) => updateEdgeData(selEdge.id, { condition: e.target.value })} />
                  </Field>
                  <label className="mb-1 flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-mute">
                    <input type="checkbox" checked={!!d.isDefault}
                      onChange={(e) => updateEdgeData(selEdge.id, {
                        isDefault: e.target.checked,
                        condition: e.target.checked ? undefined : d.condition,
                      })} />
                    设为默认分支(条件全不命中时走此路径)
                  </label>
                </>
              ) : (
                <div className="rounded-[8px] border border-line-soft bg-bg-raised p-2.5 text-[12px] leading-relaxed text-ink-faint">
                  普通顺序流,无需条件。仅排他网关的出边支持条件表达式。
                </div>
              )}
              {delBtn}
            </div>
          );
        })()
      ) : (
        <div>
          <p className="mb-3.5 text-[12px] font-semibold">流程属性</p>
          <Field label="流程 KEY"><code className="font-mono text-[12px] text-ink-mute">expense-approval</code></Field>
          <Field label="统计">
            <span className="text-[12.5px] text-ink-mute">{nodes.length} 个节点 · {edges.length} 条连线</span>
          </Field>
          <div className="mt-4 rounded-[8px] border border-line-soft bg-bg-raised p-2.5 text-[12px] leading-relaxed text-ink-faint">
            选中节点或连线以编辑属性。<br />
            · 从节点右侧圆点拖出可创建连线<br />
            · 滚轮缩放,拖动空白处平移<br />
            · ⌘Z 撤销 / ⌘⇧Z 重做 / Delete 删除
          </div>
        </div>
      )}
    </aside>
  );
}
