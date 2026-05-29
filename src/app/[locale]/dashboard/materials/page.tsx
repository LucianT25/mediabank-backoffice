import { serverFetch, routes } from "@/lib/fetcher";
import { authOptions } from "@/lib/next-auth-options";
import { parseSearchParams } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import {MaterialsTable} from "@/components/blocks/dashboard/materials/materials-table";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function MaterialsPage({
                                               params,
                                               searchParams,
                                           } : {
                                               params: Params;
                                               searchParams: SearchParams;
                                           }
) {
    const queryString = parseSearchParams(await searchParams);
    const t = await getTranslations('Materials');
    const tMessages = await getTranslations('Messages');
    const session = await getServerSession(authOptions as any);
    const materials = await serverFetch(routes.material + '/manufacturer/' + (session as any)?.user?.organisation + '?' + queryString);

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {materials.error && (
            <p className="mt-4 text-sm text-destructive">{tMessages('genericError')}</p>
        )}
        <MaterialsTable rows={materials.data?.rows ?? []} total={materials.data?.total ?? 0}/>
    </div>;
}
