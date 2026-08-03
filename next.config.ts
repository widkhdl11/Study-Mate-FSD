import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // 동적 페이지(상세 등)를 네비게이션마다 새로 가져오도록 클라이언트 Router Cache 우회.
    // 게시글 상세 재진입 시 조회수/좋아요가 캐시된 옛 스냅샷으로 어긋나던 문제 해결.
    staleTimes: {
      dynamic: 0,
    },
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