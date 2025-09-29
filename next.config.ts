import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,
  experimental: {
    optimizePackageImports: [
      "lodash",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "@radix-ui/react-dialog",
      "sonner",
      "convex",
      "clsx",
      "xyflow/react",
    ],
  },
};

export default nextConfig;
