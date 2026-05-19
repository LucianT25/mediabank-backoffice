"use client";

import { useData } from '@/context/data-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function StripePage() {
  const { reseller } = useData();

  const [stripeLoginLink, setStripeLoginLink] = useState<string | undefined>();

  useEffect(() => {
    if (!stripeLoginLink && reseller.stripeOnboarded) {
      const fetchLoginLink = async () => {
        const response = await fetch(`/api/stripe/create-login-link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: reseller?.stripeAccountId,
          }),
        });

        if (!response.ok) {
          // Handle errors on the client side here
          const { error } = await response.json();
          throw new Error("An error occurred: ", error);
        } else {
          const { url } = await response.json();
          setStripeLoginLink(url)
        }
      }

      fetchLoginLink()
    }
  }, [reseller, stripeLoginLink]);

  return <div className="flex flex-col px-10 py-4 gap-4">
    <h1 className="text-2xl font-bold">Stripe Dashboard</h1>
    {stripeLoginLink?.length && <Link href={stripeLoginLink} target="_blank">
      <Button size={'lg'}>Go to Dashboard <ExternalLink /></Button>
    </Link>}
  </div>
}
