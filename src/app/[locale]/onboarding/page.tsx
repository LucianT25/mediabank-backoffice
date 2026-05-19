import { routes, serverFetch } from '@/lib/fetcher';
import { Onboarding } from '@/components/blocks/onboarding/onboarding';

export default async function OnboardingPage() {
  const reseller = await serverFetch(routes.reseller + `/user`);

  return <div>
    <Onboarding reseller={reseller.data}/>
  </div>
}
