"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { AdminType } from "@/interfaces/user.interface";
import { Terminal } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function StripeWarning() {
    const { reseller } = useData();
    const {data: session} = useSession();
    const isReseller = (session?.user as any)?.role === AdminType.Reseller;
    const t = useTranslations('StripeWarning');

    return (
        <>
            {reseller && !reseller.stripeOnboarded && isReseller && <Alert variant="info" className="flex items-center justify-between p-4">
                <Terminal className="h-4 w-4 my-2"/>
                <div>
                    <AlertTitle>{t('welcome')}</AlertTitle>
                    <AlertDescription>
                        {t('completeOnboarding')}
                    </AlertDescription>
                </div>
                <Link href="/onboarding">
                    <Button variant="default" size="lg"
                            className="text-primary bg-primary-foreground hover:bg-accent">{t('start')}</Button>
                </Link>
            </Alert>}
        </>
    );
}
 