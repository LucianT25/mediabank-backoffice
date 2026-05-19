import {routes, serverFetch} from "@/lib/fetcher";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth-options";
import {forbidden, notFound} from "next/navigation";
import {AdminType} from "@/interfaces/user.interface";
import {OrderFulfillmentDetails} from "@/components/blocks/dashboard/orders/order-fulfillment-details";

type Params = Promise<{ orderFulfillmentId: string }>
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
    if (![AdminType.Manufacturer].includes((session as any).user?.role)) return forbidden();

    const {orderFulfillmentId} = await params;

    const orderFulfillment = await serverFetch(`${routes.orderFulfillment}/${orderFulfillmentId}`);

    if (!orderFulfillment.data) return notFound();

    return <div className="px-10">
        {orderFulfillment.data && <OrderFulfillmentDetails orderFulfillment={orderFulfillment.data}/>}
    </div>
}