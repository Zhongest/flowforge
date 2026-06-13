import { describe, it, expect } from "vitest";
import { validateGraph, hasBlockingError } from "./validate";
import type { ProcessGraph } from "./types";

const g = (
  nodes: ProcessGraph["nodes"],
  edges: ProcessGraph["edges"] = [],
): ProcessGraph => ({ nodes, edges });

const start = { id: "s", type: "startEvent" as const, position: { x: 0, y: 0 }, data: { label: "开始" } };
const end = { id: "e", type: "endEvent" as const, position: { x: 0, y: 0 }, data: { label: "结束" } };
const task = (id: string, extra = {}) => ({
  id, type: "userTask" as const, position: { x: 0, y: 0 },
  data: { label: id, assignee: "user" as const, formKey: "f", ...extra },
});

describe("validateGraph", () => {
  it("空图报告缺少开始与结束事件", () => {
    const issues = validateGraph(g([]));
    expect(issues.some((i) => i.message.includes("开始事件"))).toBe(true);
    expect(issues.some((i) => i.message.includes("结束事件"))).toBe(true);
  });

  it("合法的线性流程无阻断错误", () => {
    const issues = validateGraph(g(
      [start, task("t1"), end],
      [
        { id: "a", source: "s", target: "t1" },
        { id: "b", source: "t1", target: "e" },
      ],
    ));
    expect(hasBlockingError(issues)).toBe(false);
  });

  it("孤立节点被标记为错误", () => {
    const issues = validateGraph(g(
      [start, task("t1"), task("orphan"), end],
      [
        { id: "a", source: "s", target: "t1" },
        { id: "b", source: "t1", target: "e" },
      ],
    ));
    expect(issues.some((i) => i.nodeId === "orphan" && i.level === "error")).toBe(true);
  });

  it("排他网关多出边缺条件 → 阻断错误", () => {
    const gw = { id: "g", type: "exclusiveGateway" as const, position: { x: 0, y: 0 }, data: { label: "网关" } };
    const issues = validateGraph(g(
      [start, gw, task("t1"), task("t2"), end],
      [
        { id: "a", source: "s", target: "g" },
        { id: "b", source: "g", target: "t1" },          // 无条件
        { id: "c", source: "g", target: "t2", isDefault: true },
        { id: "d", source: "t1", target: "e" },
        { id: "f", source: "t2", target: "e" },
      ],
    ));
    expect(issues.some((i) => i.nodeId === "g" && i.level === "error")).toBe(true);
  });

  it("排他网关出边均有条件且含默认分支 → 通过", () => {
    const gw = { id: "g", type: "exclusiveGateway" as const, position: { x: 0, y: 0 }, data: { label: "网关" } };
    const issues = validateGraph(g(
      [start, gw, task("t1"), task("t2"), end],
      [
        { id: "a", source: "s", target: "g" },
        { id: "b", source: "g", target: "t1", condition: "amount > 5000" },
        { id: "c", source: "g", target: "t2", isDefault: true },
        { id: "d", source: "t1", target: "e" },
        { id: "f", source: "t2", target: "e" },
      ],
    ));
    expect(hasBlockingError(issues)).toBe(false);
  });

  it("不可达节点被标记", () => {
    const issues = validateGraph(g(
      [start, task("reachable"), task("island1"), task("island2"), end],
      [
        { id: "a", source: "s", target: "reachable" },
        { id: "b", source: "reachable", target: "e" },
        { id: "c", source: "island1", target: "island2" }, // 自成环,不可达
        { id: "d", source: "island2", target: "island1" },
      ],
    ));
    expect(issues.some((i) => i.nodeId === "island1" && i.message.includes("不可达"))).toBe(true);
  });

  it("userTask 缺处理人/表单 → 警告而非错误", () => {
    const issues = validateGraph(g(
      [start, task("t1", { assignee: undefined, formKey: undefined }), end],
      [
        { id: "a", source: "s", target: "t1" },
        { id: "b", source: "t1", target: "e" },
      ],
    ));
    expect(hasBlockingError(issues)).toBe(false);
    expect(issues.filter((i) => i.level === "warning").length).toBeGreaterThanOrEqual(2);
  });
});
