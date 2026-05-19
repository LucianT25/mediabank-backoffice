import {routes, serverFetch} from "@/lib/fetcher";
import {parseSearchParams} from "@/lib/utils";
import {AdminsTable} from "@/components/blocks/dashboard/admins/admins-table";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default async function AdminsPage({
                                             params,
                                             searchParams,
                                         }: {
    params: Params;
    searchParams: SearchParams;
}) {
    const queryString = parseSearchParams(await searchParams);
    const t = await getTranslations('Admins');
    const admins = await serverFetch(routes.user + '/admins?' + queryString);
    const resellers = await serverFetch(routes.reseller + '?min=true');
    const manufacturers = await serverFetch(routes.manufacturer + '?min=true');

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <AdminsTable admins={admins.data ?? []} resellers={resellers.data ?? []} manufacturers={manufacturers.data ?? []}/>
    </div>
}