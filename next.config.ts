import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['zod', 'lucide-react', '@radix-ui/react-avatar', 'date-fns'],
    // optimizeCss: true,
    proxyClientMaxBodySize: '50mb',
      serverActions: {
        bodySizeLimit: '50mb',
      },
    },
    images: {
      remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] || '',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)