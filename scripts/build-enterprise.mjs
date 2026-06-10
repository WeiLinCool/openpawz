#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const defaults = {
  OPENPAWZ_BUILD_EDITION: 'enterprise',
  OPENPAWZ_ENTERPRISE_ISSUER_URL: 'http://localhost:3000',
  OPENPAWZ_ENTERPRISE_CLIENT_ID: 'openpawz-desktop',
  OPENPAWZ_ENTERPRISE_DEFAULT_MODEL: 'gpt-4o-mini',
};

const args = process.argv.slice(2);
const command = args.length > 0 ? args : ['tauri', 'build'];
const isDev = command[0] === 'tauri' && command[1] === 'dev';
const devDefaults = isDev ? { OPENPAWZ_ENTERPRISE_RESET_SESSION: '1' } : {};
const env = { ...process.env, ...defaults, ...devDefaults, ...process.env };

if (isDev && env.OPENPAWZ_ENTERPRISE_RESET_SESSION !== '0') {
  resetEnterpriseSession();
}

function resetEnterpriseSession() {
  const brandId = (env.OPENPAWZ_BRAND_ID || 'taiji').trim().toLowerCase();
  const namespace = `${brandId}-enterprise`;
  const dbPath = join(homedir(), `.paw-${namespace}`, 'engine.db');
  if (!existsSync(dbPath)) return;

  spawnSync(
    'sqlite3',
    [
      dbPath,
      `
      UPDATE engine_config
      SET value = json_set(
        value,
        '$.access_token', '',
        '$.refresh_token', NULL,
        '$.user_email', NULL,
        '$.organization_id', NULL,
        '$.plan', NULL,
        '$.entitlements', json_array(),
        '$.expires_at', NULL
      )
      WHERE key = 'enterprise_config';
      `,
    ],
    { stdio: 'ignore' },
  );
}

const result = spawnSync('node', ['scripts/brand.mjs', ...command], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
