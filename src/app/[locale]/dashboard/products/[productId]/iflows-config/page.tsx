import { serverFetch, routes } from '@/lib/fetcher';
import IflowsConfigurator from '@/components/blocks/dashboard/products/iflows-configurator';
import EquipmentProfilesConfigurator from '@/components/blocks/dashboard/products/equipment-profiles-configurator';

type Params = Promise<{ productId: string }>;

export default async function ProductIflowsConfigPage({
  params,
}: {
  params: Params;
}) {
  const { productId } = await params;
  const [productRes, rulesRes, equipmentsRes] = await Promise.all([
    serverFetch(`${routes.product}/${productId}?fonts=false`),
    serverFetch(`${routes.iflows}/products/${productId}/equipment-rules`),
    serverFetch(`${routes.iflows}/equipments`),
  ]);

  const product = productRes.data?.data ?? productRes.data;
  const rulesPayload = rulesRes.data?.data ?? rulesRes.data;
  const equipments = equipmentsRes.data?.data ?? equipmentsRes.data ?? [];
  const ruleMaterials = rulesPayload?.materials ?? [];

  return (
    <div className="space-y-8 px-10 py-4">
      <IflowsConfigurator
        productId={productId}
        iflowsProductCode={product?.iflowsProductCode ?? ''}
        iflowsAdministration={product?.iflowsAdministration ?? ''}
      />
      <EquipmentProfilesConfigurator
        productId={productId}
        productName={product?.name ?? ''}
        productType={rulesPayload?.productType ?? product?.type ?? ''}
        initialRules={rulesPayload?.rules ?? product?.iflowsEquipmentRules ?? []}
        equipments={equipments}
        materials={ruleMaterials}
      />
    </div>
  );
}
