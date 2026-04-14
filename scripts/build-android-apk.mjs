import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  EAS_NO_VCS: '1',
};

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['eas', 'build', '--platform', 'android', '--profile', 'preview'],
  {
    stdio: 'inherit',
    env,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
