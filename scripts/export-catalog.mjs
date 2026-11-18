// Prepares data and static files for the Next.js app.
// 1. Runs build.mjs, which assembles the vendor catalog (vendors.txt, vendor-categories.json, overrides)
//    and writes data/catalog.json.
// 2. Copies static files Next.js serves as-is into public/: images and fonts, plus the admin console,
//    which has not moved to Next.js yet.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

execFileSync(process.execPath, ['build.mjs'], { stdio: 'inherit' });

const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.cpSync(from, to, { recursive: true }); };
copy('assets', 'public/assets');
copy('dist/admin', 'public/admin');
for (const file of ['admin.js', 'admin-config.js', 'admin-workflows.js', 'admin.css', 'site-settings.js', 'vendors-data.js', 'styles.css', 'site.css', 'home.css', 'robots.txt', 'llms.txt', 'llms-full.txt', 'sitemap.xml', 'sitemap.xsl', 'locales.json']) {
  if (fs.existsSync(path.join('dist', file))) copy(path.join('dist', file), path.join('public', file));
}
console.log('Wrote data/catalog.json and public/');
