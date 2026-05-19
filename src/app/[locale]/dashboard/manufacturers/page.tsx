import { ManufacturersTable } from "@/components/blocks/dashboard/manufacturers/manufacturers-table";
import { routes, serverFetch } from "@/lib/fetcher";
import { parseSearchParams } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
export default async function ManufacturersPage({
    params,
    searchParams,
} : {
    params: Params;
    searchParams: SearchParams;
}) {
    const queryString = parseSearchParams(await searchParams);
    const t = await getTranslations('Manufacturers');
    const data = await serverFetch(routes.manufacturer + '?min=false&' + queryString);
    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <ManufacturersTable data={data.data ?? []}/>
    </div>
}