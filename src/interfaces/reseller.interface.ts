import { Manufacturer } from "./manufacturer.interface";

export interface ResellerCatalogItem {
    product: string;
    markup: number;
}

export interface Reseller {
    id: string;

    name: string;

    key: string;

    stripeOnboarded: boolean;

    stripeAccountId: string;

    manufacturers?: Manufacturer[];

    catalog?: ResellerCatalogItem[];
}
