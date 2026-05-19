import {routes, serverFetch} from "@/lib/fetcher";
import {parseSearchParams} from "@/lib/utils";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth-options";
import {forbidden} from "next/navigation";
import {AdminType} from "@/interfaces/user.interface";
import {AdminOrdersTable} from "@/components/blocks/dashboard/orders/admin-orders-table";
import {ResellerOrdersTable} from "@/components/blocks/dashboard/orders/reseller-orders-table";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ reseller: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default async function AdminOrdersPage({
                                                  params,
                                                  searchParams,
                                              }: {
    params: Params;
    searchParams: SearchParams;
}) {
    const t = await getTranslations('Orders');
    const session = await getServerSession(authOptions as any);

    if (!session) return forbidden();
    if (![AdminType.Super, AdminType.Reseller].includes((session as any).user?.role)) return forbidden();

    const queryString = parseSearchParams(await searchParams);
    const orders = await serverFetch(routes.order + `?` + queryString);

    const role = (session as any).user?.role;
    let ordersTable;

    if (role === AdminType.Super) ordersTable = <AdminOrdersTable orders={orders.data ?? []}/>;
    if (role === AdminType.Reseller) ordersTable = <ResellerOrdersTable orders={orders.data ?? []}/>;

    return <div className="px-10 py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {ordersTable}
    </div>
}