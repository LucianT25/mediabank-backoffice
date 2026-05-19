import StripeWarning from '@/components/blocks/dashboard/resellers/stripe-warning';
import { routes, serverFetch } from '@/lib/fetcher';
import { Statistics } from '@/components/blocks/dashboard/statistics';

export default async function DashboardPage() {
  const response = await serverFetch(routes.dashboard);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StripeWarning/>
      <Statistics stats={ response.data ?? [] }/>
    </div>
  )
}
