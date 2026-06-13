import type { FlowRepository, ProcessDefinitionRecord, ProcessVersionRecord } from "./types";
import type { ProcessGraph } from "@/lib/engine/types";

const KEY = "flowforge:v1";

interface Store {
  definitions: ProcessDefinitionRecord[];
  versions: ProcessVersionRecord[];
}

function load(): Store {
  if (typeof window === "undefined") return { definitions: [], versions: [] };
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as Store;
  } catch {
    return { definitions: [], versions: [] };
  }
}

function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** 模型 A 实现:数据仅存当前浏览器,多人协作需 Phase 4 的 ApiRepository */
export class LocalStorageRepository implements FlowRepository {
  async listDefinitions() {
    return load().definitions;
  }

  async getVersion(versionId: string) {
    return load().versions.find((v) => v.id === versionId) ?? null;
  }

  async saveDraft(defId: string, graph: ProcessGraph) {
    const s = load();
    const def = s.definitions.find((d) => d.id === defId);
    if (!def) throw new Error(`流程定义不存在: ${defId}`);
    let draft = s.versions.find((v) => v.definitionId === defId && v.status === "DRAFT");
    if (!draft) {
      draft = {
        id: crypto.randomUUID(),
        definitionId: defId,
        version: def.latestVersion + 1,
        status: "DRAFT",
        graph,
      };
      s.versions.push(draft);
    } else {
      draft.graph = graph;
    }
    def.updatedAt = new Date().toISOString();
    save(s);
    return draft;
  }

  async publish(versionId: string) {
    const s = load();
    const v = s.versions.find((x) => x.id === versionId);
    if (!v) throw new Error(`版本不存在: ${versionId}`);
    if (v.status !== "DRAFT") throw new Error("仅草稿可发布");
    v.status = "PUBLISHED";
    const def = s.definitions.find((d) => d.id === v.definitionId);
    if (def) def.latestVersion = v.version;
    save(s);
    return v;
  }
}
