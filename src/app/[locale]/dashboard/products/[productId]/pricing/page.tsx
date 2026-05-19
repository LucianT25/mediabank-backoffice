import { serverFetch, routes } from "@/lib/fetcher";
import {ProductPricingConfigurator} from "@/components/blocks/dashboard/products/product-pricing-configurator";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/next-auth-options";
import { getServerSession } from "next-auth";

type Params = Promise<{ productId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ProductPricingPage({
                                                     params,
                                                     searchParams,
                                                 } : {
                                                     params: Params;
                                                     searchParams: SearchParams;
                                                 }
) {
    const t = await getTranslations('Manufacturers.PriceEngine');
    const session = await getServerSession(authOptions as any);
    const {productId} = await params;

    const productRes = await serverFetch(`${routes.product}/${productId}?fonts=false`);
    const materials = await serverFetch(`${routes.material}/manufacturer/${(session as any)?.user?.organisation}?limit=-1`);
    const priceEngineRes = await serverFetch(`${routes.priceEngine}/${productId}`);

    const product = {
        ...(productRes.data ?? {}),
        ...(priceEngineRes.data && {
            priceFormula: priceEngineRes.data.priceFormula ?? productRes.data?.priceFormula,
            priceConfiguration: priceEngineRes.data.priceConfiguration ?? productRes.data?.priceConfiguration,
            mountingFormula: priceEngineRes.data.mountingFormula,
            mountingConfiguration: priceEngineRes.data.mountingConfiguration,
            extrasFormula: priceEngineRes.data.extrasFormula,
            extrasConfiguration: priceEngineRes.data.extrasConfiguration
        })
    };

    return (
        <div className="px-6 py-6 md:px-8 md:py-8 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('configuratorTitle')}</h1>
            <ProductPricingConfigurator product={product} materials={materials.data?.rows ?? []}/>
        </div>
    );
}
