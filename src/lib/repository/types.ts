/**
 * Repository Pattern —— 数据层抽象。
 * 模型 A: LocalStorageRepository(浏览器本地,Demo 用)
 * 模型 B: ApiRepository(fetch 后端,Phase 4 实现)
 * UI 层只依赖本接口,切换实现零重写。
 */
import type { ProcessGraph } from "@/lib/engine/types";

export interface ProcessDefinitionRecord {
  id: string;
  key: string;
  name: string;
  ownerId: string;
  latestVersion: number;
  updatedAt: string;
}

export interface ProcessVersionRecord {
  id: string;
  definitionId: string;
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  graph: ProcessGraph;
}

export interface FlowRepository {
  listDefinitions(): Promise<ProcessDefinitionRecord[]>;
  getVersion(versionId: string): Promise<ProcessVersionRecord | null>;
  saveDraft(defId: string, graph: ProcessGraph): Promise<ProcessVersionRecord>;
  publish(versionId: string): Promise<ProcessVersionRecord>;
  // …TaskRepository / InstanceRepository 同模式,Phase 2-3 扩展
}
