#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const defaults = {
  OPENPAWZ_BUILD_EDITION: 'enterprise',
  OPENPAWZ_ENTERPRISE_ISSUER_URL: 'http://localhost:3000',
  OPENPAWZ_ENTERPRISE_CLIENT_ID: 'openpawz-desktop',
  OPENPAWZ_ENTERPRISE_DEFAULT_MODEL: 'gpt-4o-mini',
};

const env = { ...process.env, ...defaults, ...process.env };

const args = process.argv.slice(2);
const command = args.length > 0 ? args : ['tauri', 'build'];

const result = spawnSync('pnpm', ['exec', ...command], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
