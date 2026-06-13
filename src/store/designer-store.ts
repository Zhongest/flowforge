"use client";
import { create } from "zustand";
import {
  addEdge, applyEdgeChanges, applyNodeChanges,
  type Connection, type EdgeChange, type NodeChange,
} from "@xyflow/react";
import type { FlowNode, FlowEdge, FlowNodeData, FlowEdgeData, NodeType, ValidationIssue } from "@/lib/engine/types";
import { NODE_REGISTRY } from "@/lib/engine/node-registry";
import { validateGraph } from "@/lib/engine/validate";
import { toGraph } from "@/lib/engine/graph";
import { SEED_NODES, SEED_EDGES } from "@/lib/engine/seed";

type Selection = { kind: "node" | "edge"; id: string } | null;
interface Snapshot { nodes: FlowNode[]; edges: FlowEdge[] }

interface DesignerState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selection: Selection;
  issues: ValidationIssue[] | null;
  procName: string;
  version: number;
  status: "草稿" | "已发布";

  // history(撤销/重做)
  past: Snapshot[];
  future: Snapshot[];

  // xyflow change handlers
  onNodesChange: (c: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (c: EdgeChange<FlowEdge>[]) => void;
  onConnect: (c: Connection) => void;

  // history control
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // mutations
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateEdgeData: (id: string, patch: Partial<FlowEdgeData>) => void;
  deleteSelected: () => void;
  select: (s: Selection) => void;
  setProcName: (name: string) => void;

  // engine
  validate: () => ValidationIssue[];
  publish: () => { ok: boolean; issues: ValidationIssue[] };
}

let seq = 100;
const uid = (p: string) => `${p}_${++seq}`;
const HISTORY_LIMIT = 50;

export const useDesignerStore = create<DesignerState>((set, get) => ({
  nodes: SEED_NODES,
  edges: SEED_EDGES,
  selection: null,
  issues: null,
  procName: "差旅报销审批",
  version: 1,
  status: "草稿",
  past: [],
  future: [],

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (conn) => {
    get().takeSnapshot();
    set((s) => ({
      edges: addEdge(
        { ...conn, type: "condition", data: {} as FlowEdgeData },
        s.edges,
      ) as FlowEdge[],
      issues: null,
    }));
  },

  takeSnapshot: () =>
    set((s) => ({
      past: [...s.past, { nodes: s.nodes, edges: s.edges }].slice(-HISTORY_LIMIT),
      future: [],
    })),

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1]!;
    set((s) => ({
      nodes: prev.nodes,
      edges: prev.edges,
      past: s.past.slice(0, -1),
      future: [{ nodes, edges }, ...s.future].slice(0, HISTORY_LIMIT),
      issues: null,
    }));
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0]!;
    set((s) => ({
      nodes: next.nodes,
      edges: next.edges,
      future: s.future.slice(1),
      past: [...s.past, { nodes, edges }].slice(-HISTORY_LIMIT),
      issues: null,
    }));
  },

  addNode: (type, position) => {
    get().takeSnapshot();
    const id = uid("n");
    const node: FlowNode = { id, type, position, data: { label: NODE_REGISTRY[type].label } };
    set((s) => ({ nodes: [...s.nodes, node], selection: { kind: "node", id }, issues: null }));
  },

  updateNodeData: (id, patch) => {
    get().takeSnapshot();
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      issues: null,
    }));
  },

  updateEdgeData: (id, patch) => {
    get().takeSnapshot();
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, data: { ...e.data, ...patch } } : e)),
      issues: null,
    }));
  },

  deleteSelected: () => {
    const sel = get().selection;
    if (!sel) return;
    get().takeSnapshot();
    if (sel.kind === "node") {
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== sel.id),
        edges: s.edges.filter((e) => e.source !== sel.id && e.target !== sel.id),
        selection: null, issues: null,
      }));
    } else {
      set((s) => ({ edges: s.edges.filter((e) => e.id !== sel.id), selection: null, issues: null }));
    }
  },

  select: (selection) => set({ selection }),
  setProcName: (procName) => set({ procName }),

  validate: () => {
    const issues = validateGraph(toGraph(get().nodes, get().edges));
    set({ issues });
    return issues;
  },

  publish: () => {
    const issues = get().validate();
    const ok = !issues.some((i) => i.level === "error");
    if (ok) set({ status: "已发布" });
    return { ok, issues };
  },
}));
