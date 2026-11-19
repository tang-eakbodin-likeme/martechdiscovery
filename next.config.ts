import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Content hash of the plain stylesheets, appended to their URLs so browsers fetch a new copy after every change.
const cssVersion = createHash('sha1').update(readFileSync('styles.css')).update(readFileSync('site.css')).update(readFileSync('home.css')).digest('hex').slice(0, 10);

const nextConfig: NextConfig = {
  trailingSlash: true,
  env: { CSS_VERSION: cssVersion },
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/', destination: '/th/', permanent: false },
      // the For buyers page was removed; old links land on the directory
      { source: '/:locale(th|en)/for-buyers/', destination: '/:locale/tools/', permanent: true },
    ];
  },
};

export default nextConfig;

// Gives `next dev` the same Cloudflare bindings (the local D1 database) as production.
initOpenNextCloudflareForDev();
