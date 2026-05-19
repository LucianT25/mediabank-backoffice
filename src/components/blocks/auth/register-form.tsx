"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitData, routes } from "@/lib/fetcher";
import { useGoogleLogin } from "@react-oauth/google";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Image from 'next/image';
import icon from 'p/google.png';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const signupSchema = z.object({
  email: z.string().email('Please input a valid email.'),
  password: z.string().min(8, 'The password must be at least 8 characters long.'),
});

export function RegisterForm({
  callbackUrl
}: { callbackUrl?: string }) {

  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [requestInProgress, setRequestInProgress] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signUp = async ({ code, email, password }: { code?: string, email?: string, password?: string }) => {
    setErrorMessage('');

    let response;

    if (code) {
      setRequestInProgress('google');
      response = await signIn("credentials", {
        code: code,
        redirect: false,
        callbackUrl: '/auth/login' + callbackUrl ? `?callbackUrl=${callbackUrl}` : ''
      });
    } else {
      setRequestInProgress('password');
      response = await submitData(`${routes.auth}/register`, null, {
        email: email,
        name: name,
        password: password,
      });
      if (response && !response.error) {
        response = await signIn("credentials", {
          username: email,
          password: password,
          redirect: false,
          callbackUrl: '/auth/login' + callbackUrl ? `?callbackUrl=${callbackUrl}` : ''
        })
      } else {
        setErrorMessage(response.error?.message ?? "An error has occurred.");
      }
    }

    if (response && !response.error) {
      router.push((response as any)?.url ?? '/auth/login');
    } else if (response) {
      const serverResponse = JSON.parse(response?.error ?? '{}');
      if (Array.isArray(serverResponse.message))
        setErrorMessage(serverResponse.message[0])
      else
        setErrorMessage(serverResponse.message)
    } else {
      setErrorMessage('Invalid credentials.');
    }

    setRequestInProgress('');
  }

  useEffect(() => {
    if (errorMessage) {
      toast({
        variant: "destructive",
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
      })
    }
  }, [errorMessage, toast])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      await signUp({ code })
    },
    flow: "auth-code",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(signUp)} className={cn("flex flex-col gap-6")}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Input your credentials to continue.
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <Label htmlFor="password">Password</Label>
                <FormControl>
                  <Input type='password' placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
          {requestInProgress === 'password'
              ? <Loader2 className="w-10 animate-spin text-primary-foreground" />
              : 'Sign Up'
            }
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
          <Button
            onClick={(e) => { e.preventDefault(); handleGoogleLogin() }}
            variant="outline"
            className="self-stretch bg-white"
            disabled={!!requestInProgress}
          >
            {requestInProgress === 'google'
              ? <Loader2 className="w-10 animate-spin text-destructive" />
              : <>
                <Image className="w-6" src={icon} alt={'google'} />
                <span>{'Sign in with Google'}</span>
              </>
            }
          </Button>
        </div>
        <div className="text-center text-sm">
          Already registered?{" "}
          <a href="login" className="underline underline-offset-4">
            Log in
          </a>
        </div>

      </form>
    </Form>
  )
}
