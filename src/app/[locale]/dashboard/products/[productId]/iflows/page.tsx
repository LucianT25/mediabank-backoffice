import { serverFetch, routes } from '@/lib/fetcher';
import IflowsConfigurator from '@/components/blocks/dashboard/products/iflows-configurator';

type Params = Promise<{ productId: string }>;

export default async function ProductIflowsPage({
  params,
}: {
  params: Params;
}) {
  const { productId } = await params;
  const product = await serverFetch(`${routes.product}/${productId}?fonts=false`);

  return (
    <div className="px-10 py-4">
      <IflowsConfigurator
        productId={productId}
        iflowsProductCode={product.data?.iflowsProductCode ?? ''}
        iflowsAdministration={product.data?.iflowsAdministration ?? ''}
      />
    </div>
  );
}
