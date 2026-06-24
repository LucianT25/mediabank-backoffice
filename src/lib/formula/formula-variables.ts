/**
 * Formula variables available in pricing and equipment rule conditions.
 *
 * NOTE: mirrored in mediabank-api/src/components/formula/formula-variables.ts —
 * keep both copies in sync.
 */
import { ProductType } from '@/interfaces/product.interface';

export interface FormulaVariableDef {
  name: string;
  labelKey: string;
}

const SHARED_VARIABLES: FormulaVariableDef[] = [
  { name: 'graphicArea', labelKey: 'graphicArea' },
  { name: 'cutPerimeter', labelKey: 'cutPerimeter' },
  { name: 'plexiNestingResult', labelKey: 'plexiNestingResult' },
  { name: 'bondNestingResult', labelKey: 'bondNestingResult' },
  { name: 'oracalNestingResult', labelKey: 'oracalNestingResult' },
  { name: 'letterHeight', labelKey: 'letterHeight' },
  { name: 'letterWidth', labelKey: 'letterWidth' },
  { name: 'letterDepth', labelKey: 'letterDepth' },
  { name: 'faceMaterial', labelKey: 'faceMaterial' },
  { name: 'sideMaterial', labelKey: 'sideMaterial' },
  { name: 'extraMaterial', labelKey: 'extraMaterial' },
  { name: 'ledMaterial', labelKey: 'ledMaterial' },
  { name: 'mounting', labelKey: 'mounting' },
  { name: 'mountingWidth', labelKey: 'mountingWidth' },
  { name: 'mountingHeight', labelKey: 'mountingHeight' },
  { name: 'mountingPadding', labelKey: 'mountingPadding' },
  { name: 'isExterior', labelKey: 'isExterior' },
  { name: 'withLightSensor', labelKey: 'withLightSensor' },
  { name: 'cableLength', labelKey: 'cableLength' },
];

const BOX_VARIABLES: FormulaVariableDef[] = [
  { name: 'boxWidth', labelKey: 'boxWidth' },
  { name: 'boxHeight', labelKey: 'boxHeight' },
  { name: 'boxDepth', labelKey: 'boxDepth' },
];

const VOLUMETRIC_TYPES = new Set<string>([
  ProductType.volumetricClassic,
  ProductType.volumetricHalo,
  ProductType.volumetricSlim,
  ProductType.neonLed,
]);

const BOX_TYPES = new Set<string>([
  ProductType.boxBond,
  ProductType.boxOneFace,
  ProductType.boxTwoFaces,
  ProductType.boxCanvas,
]);

export function getFormulaVariables(productType?: string): FormulaVariableDef[] {
  if (!productType) return [...SHARED_VARIABLES];
  if (VOLUMETRIC_TYPES.has(productType)) {
    return [...SHARED_VARIABLES];
  }
  if (BOX_TYPES.has(productType)) {
    return [...BOX_VARIABLES, ...SHARED_VARIABLES];
  }
  return [];
}
