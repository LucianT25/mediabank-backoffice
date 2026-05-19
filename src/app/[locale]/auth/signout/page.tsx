"use client"
import { SplashPage } from '@/components/blocks/splash-page';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  useEffect(() => {
    const doSignout = async () => {
      if (session) {
        await signOut();
      }
      router.push(`/auth/login`)
    }

    doSignout()
  }, [session, router]);

  return <SplashPage className={'lg:basis-2/3'} />
}
