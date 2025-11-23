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
      "clsx",
      "xyflow/react",
      "socket.io-client",
    ],
  },
};

export default nextConfig;
