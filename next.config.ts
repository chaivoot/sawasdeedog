import type { NextConfig } from 'next'
import { MAX_PHOTOS, MAX_PHOTO_MB } from './src/lib/limits'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Room for the photo attachments on /submit plus multipart overhead.
      bodySizeLimit: `${MAX_PHOTOS * MAX_PHOTO_MB + 1}mb`,
    },
  },
}

export default nextConfig
