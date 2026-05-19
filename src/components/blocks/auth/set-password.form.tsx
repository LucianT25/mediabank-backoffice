"use client";

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitData, routes } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

export function SetPasswordForm({
                                      className,
                                      ...props
                                  }: React.ComponentPropsWithoutRef<"form">) {
    const [errorMessage, setErrorMessage] = useState('');
    const [requestInProgress, setRequestInProgress] = useState('');
    const { toast } = useToast();

    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    
    const t = useTranslations('SetPassword');
    const tForm = useTranslations('Form');
    const tMessages = useTranslations('Messages');
    const tAuth = useTranslations('Auth');

    const resetPasswordSchema = z.object({
        password: z.string().min(8, tForm('passwordMinLength')),
    });

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
        },
    })

    const submitResetPassword = async ({ password }: { password: string }) => {
        setErrorMessage('');

        let response;
        setRequestInProgress('sendEmail');

        try {
            response = await submitData(`${routes.auth}/reset-password?source=backoffice`, null, {
                password,
                token,
            });

            if (response.error) {
                setErrorMessage(t('resetError'));
            } else {
                toast({
                    variant: 'default',
                    title: t('success'),
                    description: tAuth(response.data?.message),
                });
                router.push(`/auth/login`);
            }
        } catch (e: any) {
            setErrorMessage(tAuth(e.message));
        } finally {
            setRequestInProgress('');
        }
    };

    useEffect(() => {
        if (errorMessage) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: errorMessage,
            });
        }
    }, [errorMessage, toast, tMessages]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submitResetPassword)} className={cn("flex flex-col gap-6", className)} {...props}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('newPassword')}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">
                        {requestInProgress ? <Loader2 className="w-10 animate-spin text-primary-foreground" /> : t('submit')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}