import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // PostHog's endpoints use trailing slashes; keep them as sent.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Analytics goes through our own domain so ad blockers don't drop it (src/lib/analytics.ts).
    return [
      { source: '/ingest/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/array/:path*', destination: 'https://eu-assets.i.posthog.com/array/:path*' },
      { source: '/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    ]
  },
  async redirects() {
    return [
      // The transport category was replaced by farewell; old links go home.
      { source: '/transport', destination: '/', permanent: true },
      { source: '/transport/:path*', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
