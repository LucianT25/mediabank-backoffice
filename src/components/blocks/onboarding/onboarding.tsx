"use client";

import { useEffect, useState } from 'react';
import useStripeConnect from '@/hooks/use-stripe-connect';
import { Reseller } from '@/interfaces/reseller.interface';
import { routes, submitData } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from '@stripe/react-connect-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

const updateResellerStripeAccountId = async (resellerId: string, stripeAccountId: string, session: any) => {
  await submitData(`${routes.reseller}/${resellerId}`, (session as any).accessToken, {
    id: resellerId,
    stripeAccountId: stripeAccountId,
  })
}

const updateResellerStripeOnboarded = async (resellerId: string, stripeOnboarded: boolean, session: any) => {
  await submitData(`${routes.reseller}/${resellerId}`, (session as any).accessToken, {
    id: resellerId,
    stripeOnboarded: stripeOnboarded,
  })
}

export const Onboarding = ({ reseller }: { reseller: Reseller }) => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>(reseller.stripeAccountId);
  const stripeConnectInstance = useStripeConnect(connectedAccountId);
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('Onboarding');

  useEffect(() => {
    if (!reseller) return;

    if (reseller.stripeAccountId) {
      setConnectedAccountId(reseller.stripeAccountId);
    } else {
      setAccountCreatePending(true);
      setError(false);
      fetch("/api/stripe/create-account", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((json) => {
          setAccountCreatePending(false);
          const { account, error } = json;

          console.log(">>> account, error:", account, error);

          if (account) {
            setConnectedAccountId(account.id);
            updateResellerStripeAccountId(reseller.id, account.id, session);
          }

          if (error) {
            setError(true);
          }
        });
    }
  }, [reseller])

  useEffect(() => {
    if (onboardingExited) {
      updateResellerStripeOnboarded(reseller.id, true, session);
      router.push(`/dashboard`);
    }
  }, [onboardingExited]);

  return <div className="container mx-auto p-10 flex flex-col gap-10">
    <Link href={`/dashboard`}>
      <Button variant="ghost"><ArrowLeft/> {t('back')}</Button>
    </Link>
    <div className="w-full flex items-center justify-center">
      {!connectedAccountId && accountCreatePending && <h2>{t('pleaseWait')}</h2>}
      {connectedAccountId && !stripeConnectInstance && <h2>{t('addInformation')}</h2>}
      {stripeConnectInstance && (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding onExit={() => setOnboardingExited(true)}/>
        </ConnectComponentsProvider>
      )}
    </div>
  </div>
}
