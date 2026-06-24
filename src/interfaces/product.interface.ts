import { ManufacturerStub } from "./manufacturer.interface";
import { FormulaExpr } from "@/lib/formula/formula-expr";

export interface ProductEquipmentRule {
  id: string;
  equipmentId: string;
  profileId?: string | null;
  conditionAst?: FormulaExpr | null;
  conditionFormula?: string;
  quantity?: string;
  digitalFile?: boolean;
  sortOrder?: number;
}

export interface CustomizationOption {
  value: string;
  label?: string;
  materials?: string[];
  colorStandard?: string;
}

export interface Customization {
  type: string;
  options?: CustomizationOption[];
  materials?: string[];
}

export interface Product {
  id: string;
  manufacturer: ManufacturerStub;
  manufacturerId: string;
  name: string;
  description: string;
  basePrice: number;
  customizations: Customization[];
  images: string[];
  createdAt: Date
  updatedAt: Date
  fontFamily?: string;
  type?: ProductType;
  priceFormula?: string;
  priceConfiguration?: { nodes: any[]; edges: any[] };
  mountingFormula?: string;
  mountingConfiguration?: { nodes: any[]; edges: any[] };
  extrasFormula?: string;
  extrasConfiguration?: { nodes: any[]; edges: any[] };
  priceFormulaAst?: FormulaExpr | null;
  mountingFormulaAst?: FormulaExpr | null;
  extrasFormulaAst?: FormulaExpr | null;
  iflowsProductCode?: string;
  iflowsAdministration?: string;
  iflowsEquipmentRules?: ProductEquipmentRule[] | null;
  nestingMarginMm?: number;
}

export enum ProductType {
  volumetricClassic = 'volumetric-classic',
  volumetricHalo = 'volumetric-halo',
  volumetricSlim = 'volumetric-slim',
  neonLed = 'neon-led',
  boxOneFace = 'box-1',
  boxTwoFaces = 'box-2',
  boxBond = 'box-bond',
  boxCanvas = 'box-canvas',
}

export interface ProductResponse {
  product: Product;
  markup: number;
}

export interface AvailableProductsResponse {
  id: string;
  name: string;
}