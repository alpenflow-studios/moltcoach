import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (Next.js 16 default for build) — empty config silences the
  // "webpack config without turbopack config" error. Dev uses --webpack flag
  // because Turbopack can't handle @xmtp/browser-sdk Web Workers + WASM.
  turbopack: {},

  webpack: (config, { isServer }) => {
    // Enable async WebAssembly (needed for @xmtp/browser-sdk WASM bindings)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle .wasm files as assets
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Exclude XMTP packages from server-side bundling
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("@xmtp/browser-sdk", "@xmtp/wasm-bindings");
      }
    }

    return config;
  },

  // Prevent XMTP browser SDK from being processed server-side
  serverExternalPackages: ["@xmtp/browser-sdk", "@xmtp/wasm-bindings"],
};

export default nextConfig;
