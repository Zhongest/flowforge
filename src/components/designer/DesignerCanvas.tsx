"use client";
import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap,
  useReactFlow, MarkerType, type IsValidConnection, type NodeMouseHandler, type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDesignerStore } from "@/store/designer-store";
import { NODE_REGISTRY } from "@/lib/engine/node-registry";
import type { FlowNode, FlowEdge, NodeType } from "@/lib/engine/types";
import { EventNode } from "./nodes/EventNode";
import { GatewayNode } from "./nodes/GatewayNode";
import { TaskNode } from "./nodes/TaskNode";
import { ConditionEdge } from "./edges/ConditionEdge";
import { NodePalette } from "./NodePalette";
import { Toolbar } from "./Toolbar";
import { PropertyPanel } from "./PropertyPanel";
import { ValidationPanel } from "./ValidationPanel";

const nodeTypes = {
  startEvent: EventNode, endEvent: EventNode,
  userTask: TaskNode, serviceTask: TaskNode, subProcess: TaskNode,
  exclusiveGateway: GatewayNode, parallelGateway: GatewayNode,
};
const edgeTypes = { condition: ConditionEdge };
const defaultEdgeOptions = {
  type: "condition",
  markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.4)", width: 16, height: 16 },
};

function Flow() {
  const store = useDesignerStore();
  const { screenToFlowPosition } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  // 连线合法性:禁止连入开始事件、连出结束事件、自环、重复边
  const isValidConnection = useCallback<IsValidConnection<FlowEdge>>((c) => {
    if (!c.source || !c.target || c.source === c.target) return false;
    const { nodes, edges } = useDesignerStore.getState();
    const src = nodes.find((n) => n.id === c.source);
    const tgt = nodes.find((n) => n.id === c.target);
    if (!src || !tgt) return false;
    if (!NODE_REGISTRY[src.type].allowOut || !NODE_REGISTRY[tgt.type].allowIn) return false;
    if (edges.some((e) => e.source === c.source && e.target === c.target)) return false;
    return true;
  }, []);

  const onNodeClick: NodeMouseHandler<FlowNode> = useCallback((_, n) => store.select({ kind: "node", id: n.id }), [store]);
  const onEdgeClick: EdgeMouseHandler<FlowEdge> = useCallback((_, e) => store.select({ kind: "edge", id: e.id }), [store]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/flowforge") as NodeType;
    if (!NODE_REGISTRY[type]) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    store.addNode(type, position);
  }, [screenToFlowPosition, store]);

  // 键盘:⌘Z 撤销 / ⌘⇧Z 重做(Delete 由 ReactFlow deleteKeyCode 接管)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? store.redo() : store.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <NodePalette />
      <div ref={wrapper} className="relative flex-1"
        onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}>
        <ReactFlow<FlowNode, FlowEdge>
          nodes={store.nodes}
          edges={store.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={store.onNodesChange}
          onEdgesChange={store.onEdgesChange}
          onConnect={store.onConnect}
          onNodeDragStart={store.takeSnapshot}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={() => store.select(null)}
          onNodesDelete={() => store.select(null)}
          isValidConnection={isValidConnection}
          deleteKeyCode={["Delete", "Backspace"]}
          snapToGrid
          snapGrid={[8, 8]}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.35}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.07)" />
          <Controls className="ff-controls" showInteractive={false} />
          <MiniMap
            pannable zoomable
            nodeColor={(n) => NODE_REGISTRY[n.type as NodeType]?.color ?? "#5C6370"}
            maskColor="rgba(10,11,14,0.7)"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-line-soft)", borderRadius: 8 }}
          />
        </ReactFlow>
        <ValidationPanel />
      </div>
      <PropertyPanel />
    </div>
  );
}

export function DesignerCanvas() {
  return (
    <div className="flex h-full flex-col">
      <ReactFlowProvider>
        <Toolbar />
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
