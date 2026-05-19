import { ProductsTable } from "@/components/blocks/dashboard/products/products-table";
import { serverFetch, routes } from "@/lib/fetcher";
import { parseSearchParams } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ProductsPage({
        params,
        searchParams,
    } : {
        params: Params;
        searchParams: SearchParams;
    }
) {
    const queryString = parseSearchParams(await searchParams);
    const t = await getTranslations('Products');
    const products = await serverFetch(routes.product + '?' + queryString);

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <ProductsTable rows={products.data.rows ?? []} total={products.data.total}/>
    </div>;
}
