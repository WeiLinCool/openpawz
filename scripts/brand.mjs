#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedRoot = path.join(repoRoot, '.brand');
const generatedPublicRoot = path.join(generatedRoot, 'public');
const activeBrandFile = path.join(generatedRoot, 'active.json');
const generatedTauriConfig = path.join(repoRoot, 'src-tauri', 'tauri.brand.generated.conf.json');

const defaultIconFiles = ['32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns', 'icon.ico'];

function parseArgs(argv) {
  let brand = process.env.OPENPAWZ_BRAND || 'taiji';
  const overrides = readOverridesFromEnv(process.env);
  const args = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--brand') {
      brand = argv[i + 1] ?? brand;
      i += 1;
    } else if (arg.startsWith('--brand=')) {
      brand = arg.slice('--brand='.length);
    } else if (arg === '--name') {
      applyNameOverride(overrides, argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--name=')) {
      applyNameOverride(overrides, arg.slice('--name='.length));
    } else if (arg === '--app-name') {
      overrides.appName = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--app-name=')) {
      overrides.appName = arg.slice('--app-name='.length);
    } else if (arg === '--short-name') {
      overrides.shortName = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--short-name=')) {
      overrides.shortName = arg.slice('--short-name='.length);
    } else if (arg === '--product-name') {
      overrides.productName = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--product-name=')) {
      overrides.productName = arg.slice('--product-name='.length);
    } else if (arg === '--window-title') {
      overrides.windowTitle = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--window-title=')) {
      overrides.windowTitle = arg.slice('--window-title='.length);
    } else if (arg === '--identifier') {
      overrides.identifier = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--identifier=')) {
      overrides.identifier = arg.slice('--identifier='.length);
    } else {
      args.push(arg);
    }
  }

  return { brand, overrides, args };
}

function readOverridesFromEnv(env) {
  const overrides = {};
  applyNameOverride(overrides, env.OPENPAWZ_NAME);
  if (env.OPENPAWZ_APP_NAME) overrides.appName = env.OPENPAWZ_APP_NAME;
  if (env.OPENPAWZ_SHORT_NAME) overrides.shortName = env.OPENPAWZ_SHORT_NAME;
  if (env.OPENPAWZ_PRODUCT_NAME) overrides.productName = env.OPENPAWZ_PRODUCT_NAME;
  if (env.OPENPAWZ_WINDOW_TITLE) overrides.windowTitle = env.OPENPAWZ_WINDOW_TITLE;
  if (env.OPENPAWZ_IDENTIFIER) overrides.identifier = env.OPENPAWZ_IDENTIFIER;
  return overrides;
}

function applyNameOverride(overrides, name) {
  if (!name) return;
  overrides.appName = name;
  overrides.shortName = name;
  overrides.productName = name;
  overrides.windowTitle = name;
}

function overridesToEnv(overrides) {
  const env = {};
  if (overrides.appName) env.OPENPAWZ_APP_NAME = overrides.appName;
  if (overrides.shortName) env.OPENPAWZ_SHORT_NAME = overrides.shortName;
  if (overrides.productName) env.OPENPAWZ_PRODUCT_NAME = overrides.productName;
  if (overrides.windowTitle) env.OPENPAWZ_WINDOW_TITLE = overrides.windowTitle;
  if (overrides.identifier) env.OPENPAWZ_IDENTIFIER = overrides.identifier;
  return env;
}

function readBrand(brandId) {
  const brandDir = path.join(repoRoot, 'branding', brandId);
  const brandFile = path.join(brandDir, 'brand.json');
  if (!existsSync(brandFile)) {
    throw new Error(`Brand "${brandId}" was not found at ${path.relative(repoRoot, brandFile)}`);
  }

  const brand = JSON.parse(readFileSync(brandFile, 'utf8'));
  for (const key of ['id', 'appName', 'shortName', 'productName', 'windowTitle', 'identifier', 'logo']) {
    if (!brand[key]) {
      throw new Error(`Brand "${brandId}" is missing required field "${key}"`);
    }
  }

  return { brand, brandDir };
}

function resolveBrandPath(brandDir, value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(brandDir, value);
}

function relativeFromTauri(absPath) {
  return path.relative(path.join(repoRoot, 'src-tauri'), absPath).split(path.sep).join('/');
}

export function prepareBrand(brandId, overrides = {}) {
  const { brand, brandDir } = readBrand(brandId);
  Object.assign(brand, overrides);
  const logoPath = resolveBrandPath(brandDir, brand.logo);
  const faviconPath = resolveBrandPath(brandDir, brand.favicon);
  const iconsDir = resolveBrandPath(brandDir, brand.iconsDir);

  if (!existsSync(logoPath)) {
    throw new Error(`Brand logo not found: ${path.relative(repoRoot, logoPath)}`);
  }
  if (iconsDir && !existsSync(iconsDir)) {
    throw new Error(`Brand iconsDir not found: ${path.relative(repoRoot, iconsDir)}`);
  }

  rmSync(generatedPublicRoot, { recursive: true, force: true });
  mkdirSync(path.join(generatedPublicRoot, 'brand'), { recursive: true });
  copyFileSync(logoPath, path.join(generatedPublicRoot, 'brand', 'logo.png'));
  if (faviconPath && existsSync(faviconPath)) {
    copyFileSync(faviconPath, path.join(generatedPublicRoot, 'brand', 'favicon.png'));
  }

  const activeBrand = {
    id: brand.id,
    appName: brand.appName,
    shortName: brand.shortName,
    productName: brand.productName,
    windowTitle: brand.windowTitle,
    identifier: brand.identifier,
    tagline: brand.tagline ?? '',
    aboutLine: brand.aboutLine ?? '',
    repositoryUrl: brand.repositoryUrl ?? '',
    logoUrl: '/brand/logo.png',
    faviconUrl: faviconPath && existsSync(faviconPath) ? '/brand/favicon.png' : '/brand/logo.png',
  };

  mkdirSync(generatedRoot, { recursive: true });
  writeFileSync(activeBrandFile, `${JSON.stringify(activeBrand, null, 2)}\n`);

  const iconFiles = brand.iconFiles ?? defaultIconFiles;
  const tauriConfig = {
    productName: brand.productName,
    identifier: brand.identifier,
    app: {
      windows: [{ title: brand.windowTitle }],
    },
  };

  if (iconsDir) {
    tauriConfig.bundle = {
      icon: iconFiles.map((file) => relativeFromTauri(path.join(iconsDir, file))),
    };
  }

  writeFileSync(generatedTauriConfig, `${JSON.stringify(tauriConfig, null, 2)}\n`);

  return {
    activeBrand,
    generatedTauriConfig,
  };
}

function withTauriConfig(args) {
  if (args[0] !== 'tauri' || !['dev', 'build'].includes(args[1])) {
    return args;
  }

  const separatorIndex = args.indexOf('--');
  const insertAt = separatorIndex === -1 ? args.length : separatorIndex;
  return [
    ...args.slice(0, insertAt),
    '--config',
    path.relative(repoRoot, generatedTauriConfig),
    ...args.slice(insertAt),
  ];
}

function main() {
  const { brand, overrides, args } = parseArgs(process.argv.slice(2));
  const command = args.length > 0 ? args : ['prepare'];

  const { activeBrand } = prepareBrand(brand, overrides);
  if (command[0] === 'prepare') {
    console.log(`Prepared brand "${activeBrand.id}" for ${activeBrand.productName}`);
    return;
  }

  const result = spawnSync('pnpm', ['exec', ...withTauriConfig(command)], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      OPENPAWZ_BRAND: activeBrand.id,
      OPENPAWZ_ACTIVE_BRAND_FILE: activeBrandFile,
      OPENPAWZ_BRAND_ID: activeBrand.id,
      OPENPAWZ_APP_NAME: activeBrand.appName,
      OPENPAWZ_SHORT_NAME: activeBrand.shortName,
      OPENPAWZ_PRODUCT_NAME: activeBrand.productName,
      OPENPAWZ_WINDOW_TITLE: activeBrand.windowTitle,
      OPENPAWZ_REPOSITORY_URL: activeBrand.repositoryUrl,
      OPENPAWZ_TAGLINE: activeBrand.tagline,
      OPENPAWZ_ABOUT_LINE: activeBrand.aboutLine,
      ...overridesToEnv(overrides),
    },
    shell: process.platform === 'win32',
  });

  process.exit(result.status ?? 1);
}

main();
