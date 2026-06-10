import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

interface BrandConfig {
  id: string;
  appName: string;
  shortName: string;
  productName: string;
  windowTitle: string;
  identifier: string;
  tagline: string;
  aboutLine: string;
  repositoryUrl: string;
  logoUrl: string;
  faviconUrl: string;
  avatarBaseUrl: string;
  avatarCount: number;
  defaultAvatar: string;
}

const fallbackBrand: BrandConfig = {
  id: 'taiji',
  appName: '太极台',
  shortName: '太极',
  productName: '太极台',
  windowTitle: '太极',
  identifier: 'com.openpawz.taiji-dragon',
  tagline: '你的 AI 指挥中心',
  aboutLine: '本地优先的智能桌面工作台',
  repositoryUrl: 'https://github.com/OpenPawz/openpawz',
  logoUrl: '/brand/logo.png',
  faviconUrl: '/brand/favicon.png',
  avatarBaseUrl: '/src/assets/avatars',
  avatarCount: 25,
  defaultAvatar: '5',
};

function loadBrand(): BrandConfig {
  const activeBrandFile = path.resolve('.brand/active.json');
  if (!existsSync(activeBrandFile)) return fallbackBrand;

  try {
    return { ...fallbackBrand, ...JSON.parse(readFileSync(activeBrandFile, 'utf8')) };
  } catch (error) {
    console.warn('[brand] Failed to load .brand/active.json:', error);
    return fallbackBrand;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeCssUrl(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function brandHtmlPlugin(): Plugin {
  const brand = loadBrand();
  const replacements: Record<string, string> = {
    OPENPAWZ_BRAND_JSON: escapeHtml(JSON.stringify(brand)),
    OPENPAWZ_BRAND_ID: escapeHtml(brand.id),
    OPENPAWZ_BRAND_APP_NAME: escapeHtml(brand.appName),
    OPENPAWZ_BRAND_SHORT_NAME: escapeHtml(brand.shortName),
    OPENPAWZ_BRAND_PRODUCT_NAME: escapeHtml(brand.productName),
    OPENPAWZ_BRAND_TAGLINE: escapeHtml(brand.tagline),
    OPENPAWZ_BRAND_ABOUT_LINE: escapeHtml(brand.aboutLine),
    OPENPAWZ_BRAND_REPOSITORY_URL: escapeHtml(brand.repositoryUrl),
    OPENPAWZ_BRAND_LOGO_URL: escapeCssUrl(brand.logoUrl),
    OPENPAWZ_BRAND_LOGO_URL_JSON: JSON.stringify(brand.logoUrl),
    OPENPAWZ_BRAND_FAVICON_URL: escapeHtml(brand.faviconUrl),
  };

  return {
    name: 'openpawz-brand-html',
    transformIndexHtml(html) {
      return html.replace(/%([A-Z0-9_]+)%/g, (match, key: string) => replacements[key] ?? match);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  publicDir: existsSync('.brand/public') ? '.brand/public' : false,
  plugins: [brandHtmlPlugin()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
