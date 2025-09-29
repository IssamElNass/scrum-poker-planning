import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 150000,
        cacheGroups: {
          reactflow: {
            test: /[\\/]node_modules[\\/]@xyflow[\\/]/,
            name: "react-flow",
            chunks: "all",
            priority: 40,
            maxSize: 100000,
          },
          convex: {
            test: /[\\/]node_modules[\\/]convex[\\/]/,
            name: "convex-client",
            chunks: "all",
            priority: 30,
            maxSize: 100000,
          },
          lodash: {
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            name: "utils",
            chunks: "all",
            priority: 25,
            maxSize: 80000,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: "ui-components",
            chunks: "all",
            priority: 20,
            maxSize: 100000,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            priority: 10,
            maxSize: 120000,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 100000,
          },
        },
      };

      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;

      // REMOVE the terser minimizer config (lines 60-76)
      // Let Next.js use its default SWC minifier instead

      config.output.chunkLoadingGlobal = "webpackChunk_app";
      config.output.hotUpdateChunkFilename = "hot-update.[id].[fullhash].js";
      config.output.hotUpdateMainFilename =
        "hot-update.[runtime].[fullhash].json";
    }

    return config;
  },
  experimental: {
    optimizePackageImports: [
      "lodash",
      "@radix-ui/react-tooltip",
      "lucide-react",
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Add these CSP headers
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
