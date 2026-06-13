import type { NextConfig } from "next";

/**
 * 模型 A:GitHub Pages 静态导出配置
 * - output: "export"      → 纯静态产物,无 Server 运行时
 * - basePath/assetPrefix  → 适配 https://<user>.github.io/flowforge 子路径
 * - images.unoptimized    → 静态导出不支持 Image Optimization API
 *
 * Phase 4 切换模型 B 时:删除 output/basePath,启用 API Routes。
 */
const isProd = process.env.NODE_ENV === "production";
const repo = "flowforge";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true, // GitHub Pages 目录式路由,避免刷新 404
};

export default nextConfig;
