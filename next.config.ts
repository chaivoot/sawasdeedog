import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The transport category was replaced by farewell; old links go home.
      { source: '/transport', destination: '/', permanent: true },
      { source: '/transport/:path*', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
