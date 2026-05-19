"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";
import { useGoogleLogin } from "@react-oauth/google"
import { Loader2 } from "lucide-react"
import Image from 'next/image'
import icon from 'p/google.png'
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

const loginSchema = z.object({
  email: z.string().min(1, 'Please input your email.').email('Please input a valid email.'),
  password: z.string().min(1, 'Please input your password.'),
});

export function LoginForm({
  callbackUrl,
}: { callbackUrl: string }) {
  const t = useTranslations('LoginForm');
  const tMessages = useTranslations('Messages');
  const tAuth = useTranslations('Auth');
  const tMisc = useTranslations('Misc');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const [requestInProgress, setRequestInProgress] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },

  })

  useEffect(() => {
    if (session?.expires) {
      const tokenDate = (new Date(session?.expires)).getTime()
      const now = Date.now();
      if (tokenDate > now) {
        router.push(callbackUrl ?? `/dashboard`);
      }
    }
  }, [router, session])

  const logIn = async ({ code, email, password }: { code?: string, email?: string, password?: string }) => {
    setErrorMessage('');

    let response;
    if (code) {
      setRequestInProgress('google');
      response = await signIn("credentials", {
        code: code,
        redirect: false,
        callbackUrl: callbackUrl ?? '/'
      })
    } else {
      setRequestInProgress('password');
      response = await signIn("credentials", {
        username: email,
        password: password,
        redirect: false,
        callbackUrl: callbackUrl ?? '/'
      })
    }

    if (response && !response.error) {
      router.push(response?.url ?? 'login');
    } else if (response) {
      const serverResponse = JSON.parse(response?.error ?? '{}');
      if (Array.isArray(serverResponse.message))
        setErrorMessage(tAuth(serverResponse.message[0]))
      else
        setErrorMessage(tAuth(serverResponse.message))
    } else {
      setErrorMessage(tMessages('invalidCredentials'));
    }

    setRequestInProgress('');
  };

  useEffect(() => {
    if (errorMessage) {
      toast({
        variant: "destructive",
        title: tMessages('genericError'),
        description: errorMessage,
      })
    }
  }, [errorMessage, toast])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      await logIn({ code })
    },
    flow: "auth-code",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(logIn)} className={cn("flex flex-col gap-6")}>
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
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input placeholder="name@domain.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    href="forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <FormControl>
                  <Input type='password' placeholder="********" {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
          {requestInProgress === 'password'
              ? <Loader2 className="w-10 animate-spin text-primary-foreground" />
              : t('login')
            }
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              {tMisc('or')}
            </span>
          </div>
          <Button
            onClick={(e) => {e.preventDefault(); handleGoogleLogin()}}
            variant="outline"
            className="self-stretch bg-white"
            disabled={!!requestInProgress}
          >
            {requestInProgress === 'google'
              ? <Loader2 className="w-10 animate-spin text-destructive" />
              : <>
                <Image className="w-6" src={icon} alt={'google'} />
                <span>{t('google')}</span>
              </>
            }
          </Button>
        </div>

      </form>
    </Form>
  )
}
