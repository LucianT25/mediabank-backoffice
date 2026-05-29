import {routes, serverFetch} from "@/lib/fetcher";
import {parseSearchParams} from "@/lib/utils";
import {BuyersTable} from "@/components/blocks/dashboard/buyers/buyers-table";
import { emptyPaginated } from "@/interfaces/paginated-data.interface";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default async function BuyersPage({
                                         params,
                                         searchParams,
                                       }: {
  params: Params;
  searchParams: SearchParams;
}) {
  const queryString = parseSearchParams(await searchParams);
  const t = await getTranslations('Buyers');
  const tMessages = await getTranslations('Messages');
  const data = await serverFetch(routes.user + '/buyers?' + queryString);

  return <div className="px-10 py-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      {data.error && (
          <p className="mt-4 text-sm text-destructive">{tMessages('genericError')}</p>
      )}
      <BuyersTable data={data.data ?? emptyPaginated()} />
  </div>
}