"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Workflow, Inbox, ListTree, LayoutDashboard, FormInput, ShieldCheck } from "lucide-react";
import { useAuth, RoleSwitcher } from "@/lib/auth/mock-auth";
import clsx from "clsx";

const NAV = [
  { href: "/inbox", label: "我的待办", icon: Inbox, roles: ["EXECUTOR", "PROCESS_OWNER", "ADMIN"] },
  { href: "/designer", label: "流程设计器", icon: Workflow, roles: ["PROCESS_OWNER", "ADMIN"] },
  { href: "/forms", label: "表单设计器", icon: FormInput, roles: ["PROCESS_OWNER", "ADMIN"] },
  { href: "/instances", label: "流程实例", icon: ListTree, roles: ["PROCESS_OWNER", "ADMIN", "AUDITOR"] },
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard, roles: ["ADMIN", "AUDITOR"] },
  { href: "/admin", label: "权限管理", icon: ShieldCheck, roles: ["ADMIN"] },
] as const;

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const visible = NAV.filter((n) => (n.roles as readonly string[]).includes(user.role));

  return (
    <div className="flex h-dvh">
      <aside className="flex w-60 flex-col border-r border-line-soft bg-bg-surface">
        <div className="flex h-14 items-center gap-2 border-b border-line-soft px-4">
          <div className="grid size-7 place-items-center rounded-[6px] bg-accent/15 text-accent">
            <Workflow size={16} />
          </div>
          <span className="text-sm font-semibold tracking-tight">FlowForge</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {visible.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13px] transition-colors",
                pathname.startsWith(href)
                  ? "bg-accent/12 text-ink"
                  : "text-ink-mute hover:bg-bg-hover hover:text-ink"
              )}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </nav>
        <RoleSwitcher />
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
