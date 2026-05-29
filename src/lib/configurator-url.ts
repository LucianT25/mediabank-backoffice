import { ProductType } from '@/interfaces/product.interface';

const VOLUMETRIC_TYPES: ProductType[] = [
  ProductType.volumetricClassic,
  ProductType.volumetricHalo,
  ProductType.volumetricSlim,
  ProductType.neonLed,
];

const BOX_TYPES: ProductType[] = [
  ProductType.boxOneFace,
  ProductType.boxTwoFaces,
  ProductType.boxBond,
  ProductType.boxCanvas,
];

export function getConfiguratorType(
  configType?: string,
  productType?: ProductType,
): 'volumetric' | 'box' | null {
  if (configType === 'volumetric' || configType === 'box') return configType;
  if (productType && VOLUMETRIC_TYPES.includes(productType)) return 'volumetric';
  if (productType && BOX_TYPES.includes(productType)) return 'box';
  return null;
}

export function buildConfiguratorUrl(params: {
  resellerKey: string;
  locale: string;
  configType?: string;
  productType?: ProductType;
  compressedConfig?: string;
  productId?: string;
}): string | null {
  const { resellerKey, locale, compressedConfig, productId, configType, productType } = params;
  if (!resellerKey || !compressedConfig) return null;

  const type = getConfiguratorType(configType, productType);
  if (!type) return null;

  const base =
    process.env.CLIENT_BASE_URL ||
    process.env.NEXT_PUBLIC_CLIENT_BASE_URL ||
    'http://localhost:3000';
  const path = type === 'box' ? 'configurator-box' : 'configurator-volumetric';
  const url = new URL(
    `${base.replace(/\/$/, '')}/${locale}/${encodeURIComponent(resellerKey)}/shop/${path}`,
  );
  url.searchParams.set('config', compressedConfig);
  if (productId) url.searchParams.set('productId', productId);
  return url.toString();
}
