// Seeds a super admin account into the LOCAL D1 database only (wrangler --local), for testing sign-in.
// Test credentials: username "test", password "test". Never run this against the remote database.
import {execFileSync} from 'node:child_process';
import {writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {passwordHash, randomHex} from '../functions/_shared/auth.js';

const USERNAME = 'test';
const PASSWORD = 'test';
const DB_NAME = 'martech-discovery-platform-prod';

const salt = randomHex(16);
const hash = await passwordHash(PASSWORD, salt);
const now = new Date().toISOString();
const q = s => `'${String(s).replace(/'/g, "''")}'`;

// Upsert so re-running resets the password; must_change_password=0 so sign-in lands on /admin/ directly.
const sql = `INSERT INTO users(username,email,name,role,status,password_salt,password_hash,must_change_password,created_at,updated_at,last_login_at)
VALUES(${q(USERNAME)},${q('test@example.test')},${q('Test Super Admin')},'super_admin','active',${q(salt)},${q(hash)},0,${q(now)},${q(now)},${q(now)})
ON CONFLICT(username) DO UPDATE SET password_salt=excluded.password_salt,password_hash=excluded.password_hash,role='super_admin',status='active',must_change_password=0,updated_at=excluded.updated_at;`;

const file = path.join(mkdtempSync(path.join(tmpdir(), 'mdp-seed-')), 'seed.sql');
writeFileSync(file, sql);
execFileSync('npx', ['wrangler', 'd1', 'execute', DB_NAME, '--local', `--file=${file}`], {stdio: 'inherit', shell: process.platform === 'win32'});
console.log(`Seeded local super admin "${USERNAME}".`);
