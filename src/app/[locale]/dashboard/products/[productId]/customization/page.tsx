import { serverFetch, routes } from "@/lib/fetcher";
import CustomizationConfigurator from "@/components/blocks/dashboard/products/customization-configurator";
import { authOptions } from "@/lib/next-auth-options";
import { getServerSession } from "next-auth";

type Params = Promise<{ productId: string }>

export default async function ProductCustomizationPage({
                                                     params,
                                                 } : {
                                                     params: Params;
                                                 }
) {
    const {productId} = await params;
    const product = await serverFetch(`${routes.product}/${productId}?fonts=false`);
    const session = await getServerSession(authOptions as any);
    const materials = await serverFetch(`${routes.material}/manufacturer/${(session as any)?.user?.organisation}?limit=-1`);
    
    return <div className="px-10 py-4">
        <CustomizationConfigurator productId={productId} customizations={product.data?.customizations ?? []} materials={materials.data ?? []}/>
    </div>;
}
