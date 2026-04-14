import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const env = {
  ...process.env,
  EAS_NO_VCS: '1',
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const easCliEntry = path.resolve(repoRoot, 'node_modules', 'eas-cli', 'bin', 'run');

if (!fs.existsSync(easCliEntry)) {
  console.error('EAS CLI was not found in node_modules. Run: npm install');
  process.exit(1);
}

const args = [
  easCliEntry,
  'build',
  '--platform',
  'android',
  '--profile',
  'preview',
];

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env,
  cwd: repoRoot,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
