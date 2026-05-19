import GoogleAuthWrapper from "@/components/google-auth-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const t = useTranslations('RegisterPage');
    const tMisc = useTranslations('Misc');
    return (
        <GoogleAuthWrapper>
            <div className="flex flex-col gap-4 items-center">
                <Link href="/auth/register/reseller" className="w-full max-w-md">
                    <Card className="w-full hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>{t('reseller')}</CardTitle>
                                <CardDescription>{t('createReseller')}</CardDescription>
                            </div>
                            <ArrowRight className="ml-2 size-5" />
                        </CardHeader>
                    </Card>
                </Link>

                {t('contactStaff')}
                <Link href="/">
                    <Button>{tMisc('back')}</Button>
                </Link>
            </div>
        </GoogleAuthWrapper>
    )
}
