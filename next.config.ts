import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Disable dev double-rendering (React.StrictMode) to avoid perceived rerender loops.
  reactStrictMode: false,
  reactCompiler: true,
  turbopack: {
    // Pin the app root so Turbopack resolves packages correctly in OneDrive/nested setups.
    root: __dirname,
    resolveAlias: {
      tailwindcss: path.join(__dirname, "node_modules", "tailwindcss"),
    },
  },
  // Improve file watching reliability on Windows/OneDrive by enabling polling.
  // NOTE: webpackDevMiddleware was removed; use the webpack hook instead.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // check for changes every second
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
