"use client";

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitData, routes } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [errorMessage, setErrorMessage] = useState('');
    const [requestInProgress, setRequestInProgress] = useState('');
    const { toast } = useToast();
 
    const t = useTranslations('ForgotPassword');
    const tAuth = useTranslations('Auth');
    const tForm = useTranslations('Form');
    const tMessages = useTranslations('Messages');

    const forgotPasswordSchema = z.object({
      email: z.string().email(tForm('emailInvalid')),
    });

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
        email: "",
      },
    })
  
    const submitForgotPassword = async ({email}: {email: string}) => {
        setErrorMessage('');
    
        let response;
        setRequestInProgress('sendEmail');
    
        try {
            response = await submitData(`${routes.auth}/forgot-password?source=backoffice`, null, {
                email,
              });

              if (response.error) {
                setErrorMessage(tAuth(response.error.message) ?? t('defaultError'));
              } else {
                toast({
                  variant: 'default',
                  title: t('checkEmail'),
                  description: tAuth(response.data?.message),
                });
              }
        } catch (e: any) {
            setErrorMessage(e.message);
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
          <form onSubmit={form.handleSubmit(submitForgotPassword)} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-balance text-sm text-muted-foreground">
                {t('description')}
              </p>
            </div>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tForm('emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {requestInProgress ? <Loader2 className="w-10 animate-spin text-primary-foreground"/> : t('submit')}
              </Button>
            </div>
            <div className="text-center text-sm">
              {t('rememberedPassword')}{" "}
              <Link href="login" className="underline underline-offset-4">
                {t('signIn')}
              </Link>
            </div>
          </form>
        </Form>
      )
}