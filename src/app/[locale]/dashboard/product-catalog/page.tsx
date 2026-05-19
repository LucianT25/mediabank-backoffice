import { ProductCatalogTable } from "@/components/blocks/dashboard/products/product-catalog-table";
import { serverFetch, routes } from "@/lib/fetcher";
import { authOptions } from "@/lib/next-auth-options";
import { parseSearchParams } from "@/lib/utils";
import { getServerSession } from "next-auth";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ProductCatalogPage({
        params,
        searchParams,
    } : {
        params: Params;
        searchParams: SearchParams;
    }
) {
    const queryString = parseSearchParams(await searchParams);
    const session = await getServerSession(authOptions as any);
    const data = await serverFetch(routes.reseller + '/products/' + (session as any)?.user?.organisation + '?source=backoffice&' + queryString);
    const availableProducts = await serverFetch(routes.reseller + '/available-products/' + (session as any)?.user?.organisation);

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <ProductCatalogTable data={data.data ?? []} availableProducts={availableProducts.data ?? []}/>
    </div>;
}
