"use client";
/**
 * 模型 A:Mock 认证 Provider(角色切换器)
 * Phase 4 切换为企业微信 OAuth:仅替换本 Provider 实现,
 * useAuth() 接口签名保持不变,业务组件零改动。
 *
 * ⚠️ 企业微信 CorpSecret 永远不会出现在前端代码中——
 * 真实 OAuth 的 code 换 token 在后端完成(模型 B)。
 */
import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "ADMIN" | "PROCESS_OWNER" | "EXECUTOR" | "AUDITOR";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  departmentId?: string;
}

const MOCK_USERS: Record<Role, AuthUser> = {
  ADMIN: { id: "u_admin", name: "林管理", role: "ADMIN" },
  PROCESS_OWNER: { id: "u_owner", name: "陈流程", role: "PROCESS_OWNER", departmentId: "d_fin" },
  EXECUTOR: { id: "u_exec", name: "王执行", role: "EXECUTOR", departmentId: "d_fin" },
  AUDITOR: { id: "u_audit", name: "赵审计", role: "AUDITOR" },
};

interface AuthCtx {
  user: AuthUser;
  switchRole: (r: Role) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(MOCK_USERS.PROCESS_OWNER);
  return (
    <Ctx.Provider value={{ user, switchRole: (r) => setUser(MOCK_USERS[r]) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within MockAuthProvider");
  return ctx;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "管理员", PROCESS_OWNER: "流程负责人", EXECUTOR: "执行者", AUDITOR: "审计员",
};

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  return (
    <div className="border-t border-line-soft p-3">
      <p className="mb-1.5 text-[11px] text-ink-faint">演示模式 · 切换角色</p>
      <select
        aria-label="切换演示角色"
        value={user.role}
        onChange={(e) => switchRole(e.target.value as Role)}
        className="w-full rounded-[6px] border border-line bg-bg-raised px-2 py-1.5 text-[13px] outline-none focus:border-accent"
      >
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]} · {MOCK_USERS[r].name}</option>
        ))}
      </select>
    </div>
  );
}
