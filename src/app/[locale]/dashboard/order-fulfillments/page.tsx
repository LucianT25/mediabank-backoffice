import {routes, serverFetch} from "@/lib/fetcher";
import {parseSearchParams} from "@/lib/utils";
import {authOptions} from "@/lib/next-auth-options";
import {getServerSession} from "next-auth";
import {OrderFulfillmentsTable} from "@/components/blocks/dashboard/orders/order-fulfillments-table";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default async function OrderFulfillmentsPage({
                                                        params,
                                                        searchParams,
                                                    }: {
    params: Params;
    searchParams: SearchParams;
}) {
    const session = await getServerSession(authOptions as any);
    const t = await getTranslations('Fulfillments');

    // if (!session) return forbidden();
    // if ((session as any).user?.role !== AdminType.Manufacturer) return forbidden();

    const queryString = parseSearchParams(await searchParams);
    const orderFulfillments = await serverFetch(`${routes.orderFulfillment}/manufacturer/${(session as any).user?.organisation}?${queryString}`);

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <OrderFulfillmentsTable data={orderFulfillments.data ?? []}/>
    </div>
}