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
  id: 'openpawz',
  appName: '太极台',
  shortName: '太极',
  productName: '太极台',
  windowTitle: '太极台',
  identifier: 'com.openpawz.openpawz',
  tagline: 'Your AI command center',
  aboutLine: 'Pawz are safer than Claws',
  repositoryUrl: 'https://github.com/OpenPawz/openpawz',
  logoUrl: 'branding/taiji-dragon/logo.png',
  faviconUrl: '/branding/taiji-dragon/favicon.png',
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
  return template.split('{appName}').join(brand.appName).split('{shortName}').join(brand.shortName);
}
