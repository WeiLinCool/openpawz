export interface BrandConfig {
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
};

function readBrandMeta(): Partial<BrandConfig> {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="openpawz-brand"]');
  if (!meta?.content) return {};

  try {
    return JSON.parse(meta.content) as Partial<BrandConfig>;
  } catch (error) {
    console.warn('[brand] Failed to parse brand metadata:', error);
    return {};
  }
}

export const brand: BrandConfig = {
  ...fallbackBrand,
  ...readBrandMeta(),
};

export function formatBrandText(template: string): string {
  return template
    .split('{appName}')
    .join(brand.appName)
    .split('{shortName}')
    .join(brand.shortName)
    .split('{productName}')
    .join(brand.productName)
    .split('{windowTitle}')
    .join(brand.windowTitle)
    .split('Open Pawz')
    .join(brand.appName)
    .split('OpenPawz')
    .join(brand.appName);
}
