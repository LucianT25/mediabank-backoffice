import { ManufacturerStub } from "./manufacturer.interface";

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
  iflowsProductCode?: string;
  iflowsAdministration?: string;
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