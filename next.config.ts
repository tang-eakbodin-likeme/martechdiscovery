import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return [{ source: '/', destination: '/th/', permanent: false }];
  },
};

export default nextConfig;

// Gives `next dev` the same Cloudflare bindings (the local D1 database) as production.
initOpenNextCloudflareForDev();
