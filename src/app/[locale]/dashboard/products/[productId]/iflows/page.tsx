import { redirect } from 'next/navigation';

type Params = Promise<{ locale: string; productId: string }>;

export default async function ProductIflowsRedirect({
  params,
}: {
  params: Params;
}) {
  const { locale, productId } = await params;
  redirect(`/${locale}/dashboard/products/${productId}/iflows-config`);
}
