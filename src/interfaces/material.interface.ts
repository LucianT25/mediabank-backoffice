export interface Material {
    id: string;
    name: string;
    colorName: string;
    colorCode: string;
    colorHex: string;
    colorStandard: string;
    colorFinish: string;
    productAlias: string;
    iflowsProductCode?: string;
    currency: string;
    salesUnit: string;
    purchasePrice: number;
    addedPrice: number;
    salePrice: number;
    equipment: string;
    workProfile: string;
    materialSize: string;
    sizeUnit: string;
    weightKg: number;
    weightUnit: string;
    optimizationOptions: string;
    optimizationType: string;
    ledDensity: string | null;
    aspect: string;
}