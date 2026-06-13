import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { MockAuthProvider } from "@/lib/auth/mock-auth";

export const metadata: Metadata = {
  title: "FlowForge — 企业级流程管理",
  description: "无代码流程设计、表单、待办与可视化追踪",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <MockAuthProvider>{children}</MockAuthProvider>
        <Toaster theme="dark" position="top-center" toastOptions={{
          style: {
            background: "var(--color-bg-raised)",
            border: "1px solid var(--color-line)",
            color: "var(--color-ink)",
          },
        }} />
      </body>
    </html>
  );
}
