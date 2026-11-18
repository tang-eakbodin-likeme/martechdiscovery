// Runs the old static site (dist/ + functions/) with `wrangler pages dev` on port 8788.
// wrangler.jsonc now configures the Next.js Worker and Wrangler finds it from any folder inside the
// project, so this copies the old site to a temp folder with a Pages-style config. It shares the
// same local D1 data (.wrangler/state), so the test account works on both versions.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

execFileSync(process.execPath, ['build.mjs'], { stdio: 'inherit' });

const root = process.cwd();
const dir = path.join(os.tmpdir(), 'mdp-legacy-site');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
fs.cpSync('dist', path.join(dir, 'dist'), { recursive: true });
fs.cpSync('functions', path.join(dir, 'functions'), { recursive: true });
const config = fs.readFileSync('wrangler.jsonc', 'utf8')
  .replace(/"\$schema":[^\n]*\n/, '')
  .replace(/"main":[^\n]*\n/, '"pages_build_output_dir": "./dist",\n')
  .replace(/\s*"assets":[^\n]*\n/, '\n')
  .replace(/"migrations_dir": "migrations"/, `"migrations_dir": ${JSON.stringify(path.join(root, 'migrations'))}`);
fs.writeFileSync(path.join(dir, 'wrangler.jsonc'), config);

const wrangler = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler');
spawn(`"${wrangler}"`, ['pages', 'dev', 'dist', '--port', '8788', '--persist-to', `"${path.join(root, '.wrangler', 'state')}"`], { cwd: dir, stdio: 'inherit', shell: true })
  .on('exit', (code) => process.exit(code ?? 0));
