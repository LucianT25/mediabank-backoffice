import {routes, serverFetch} from "@/lib/fetcher";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth-options";
import {forbidden, notFound} from "next/navigation";
import {AdminType} from "@/interfaces/user.interface";
import {OrderDetails} from "@/components/blocks/dashboard/orders/order-details";

type Params = Promise<{ orderId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default async function AdminOrderDetailsPage({
                                                           params,
                                                           searchParams,
                                                       }: {
    params: Params;
    searchParams: SearchParams;
}) {
    const session = await getServerSession(authOptions as any);

    if (!session) return forbidden();
    if (![AdminType.Super, AdminType.Reseller].includes((session as any).user?.role)) return forbidden();

    const {orderId} = await params;

    const order = await serverFetch(`${routes.order}/${orderId}`);

    if (!order.data) return notFound();

    return <div className="px-10">
        {order.data && <OrderDetails order={order.data}/>}
    </div>
}