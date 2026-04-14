import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const normalizedRoot = path.resolve(scriptDir, '..');

const outputDir = path.join(normalizedRoot, 'dist-sdk');
const archiveName = 'taxi-rush-sdk';
const date = new Date();
const pad = (value) => String(value).padStart(2, '0');
const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
const archivePath = path.join(outputDir, `${archiveName}-${timestamp}.zip`);
const latestPath = path.join(outputDir, `${archiveName}-latest.zip`);

const excludeDirs = new Set(['.git', 'node_modules', 'dist', 'dist-sdk', '.expo']);

const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'taxi-rush-sdk-'));
const stageRoot = path.join(tmpBase, archiveName);

const shouldExclude = (relativePath, isDirectory) => {
  const normalized = relativePath.split(path.sep).join('/');
  if (!normalized || normalized === '.') {
    return false;
  }

  if (normalized.endsWith('.log')) {
    return true;
  }

  const topLevel = normalized.split('/')[0];
  if (excludeDirs.has(topLevel)) {
    return true;
  }

  if (isDirectory && excludeDirs.has(normalized)) {
    return true;
  }

  return false;
};

const copyRecursive = (source, destination, relative = '') => {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    if (shouldExclude(relative, true)) {
      return;
    }
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      const srcChild = path.join(source, entry);
      const dstChild = path.join(destination, entry);
      const relChild = relative ? path.join(relative, entry) : entry;
      copyRecursive(srcChild, dstChild, relChild);
    }
    return;
  }

  if (shouldExclude(relative, false)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const cleanup = () => {
  fs.rmSync(tmpBase, { recursive: true, force: true });
};

try {
  fs.mkdirSync(outputDir, { recursive: true });
  copyRecursive(normalizedRoot, stageRoot);

  let zipResult;
  if (process.platform === 'win32') {
    zipResult = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Compress-Archive -Path '${stageRoot.replace(/'/g, "''")}\\*' -DestinationPath '${archivePath.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: 'inherit' },
    );
    if (zipResult.status !== 0) {
      throw new Error('Failed to create zip using PowerShell Compress-Archive.');
    }
  } else {
    zipResult = spawnSync('zip', ['-qr', archivePath, archiveName], {
      cwd: tmpBase,
      stdio: 'inherit',
    });
    if (zipResult.status !== 0) {
      throw new Error('Failed to create zip using zip command.');
    }
  }

  fs.copyFileSync(archivePath, latestPath);

  console.log(`SDK package created: ${archivePath}`);
  console.log(`Latest SDK package: ${latestPath}`);
} finally {
  cleanup();
}
