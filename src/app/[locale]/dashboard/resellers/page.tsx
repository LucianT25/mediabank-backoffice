import { ResellersTable } from "@/components/blocks/dashboard/resellers/resellers-table";
import { routes, serverFetch } from "@/lib/fetcher";
import { parseSearchParams } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ResellersPage({
        params,
        searchParams
    } : {
        params: Params;
        searchParams: SearchParams
    }
) {
    const queryString = parseSearchParams(await searchParams);
    const t = await getTranslations('Resellers');
    const resellers = await serverFetch(routes.reseller + '?' + queryString);
    const manufacturers = await serverFetch(routes.manufacturer);

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <ResellersTable data={resellers.data ?? []} manufacturers = { manufacturers.data ?? [] }/>
    </div>;
}