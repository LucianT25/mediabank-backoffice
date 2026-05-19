"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { clientFetch, routes, submitData } from "@/lib/fetcher";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/ui/multi-select";
import { useTranslations } from "next-intl";

export default function ResellerSignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('RegisterPage');
  const tForm = useTranslations('Form');
  const tMessages = useTranslations('Messages');
  const tAuth = useTranslations('Auth');

  const formSchema = z.object({
    email: z.string().email(tForm("emailInvalid") || "Please input a valid email."),
    name: z.string().min(2, tForm("nameMinLength") || "Name must be at least 2 characters."),
    companyName: z.string().min(2, tForm("companyNameMinLength") || "Company name must be at least 2 characters."),
    subdomain: z.string().min(2, tForm("subdomainMinLength") || "Subdomain must be at least 2 characters.")
      .regex(/^[a-z0-9-]+$/, tForm("subdomainFormat") || "Subdomain can only contain lowercase letters, numbers, and hyphens."),
    cui: z.string().min(8, tForm("cuiMinLength") || "CUI must be at least 8 characters."),
    password: z.string().min(8, tForm("passwordMinLength") || "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, tForm("confirmPasswordRequired") || "Please fill in this field."),
  }).refine((data) => data.password === data.confirmPassword, {
    message: tForm("passwordsMatch") || "Passwords must match.",
    path: ["confirmPassword"],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainExists, setSubdomainExists] = useState<boolean | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      companyName: "",
      subdomain: "",
      cui: "",
      password: "",
      confirmPassword: "",
    },
  });

  const companyName = form.watch("companyName");
  const subdomain = form.watch("subdomain");

  const debouncedCompanyName = useDebounce(companyName, 500);
  const debouncedSubdomain = useDebounce(subdomain, 1000);

  // Generate subdomain from company name
  useEffect(() => {
    if (debouncedCompanyName) {
      const generatedSubdomain = debouncedCompanyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      form.setValue("subdomain", generatedSubdomain);
    }
  }, [debouncedCompanyName, form]);

  // Check subdomain availability
  useEffect(() => {
    const checkSubdomain = async () => {
      if (debouncedSubdomain && debouncedSubdomain.length >= 2) {
        setIsCheckingSubdomain(true);
        setSubdomainExists(null);
        
        try {
          const response = await clientFetch(`${routes.reseller}/check-key/${debouncedSubdomain}`);
          setSubdomainExists(response.data.exists);
          
          if (response.data.exists) {
            form.setError("subdomain", {
              type: "manual",
              message: tMessages('subdomainTaken') || "This subdomain is already taken.",
            });
          } else {
            form.clearErrors("subdomain");
          }
        } catch (error) {
          console.error("Error checking subdomain:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: tMessages('subdomainFailed') || "Failed to check subdomain availability",
          });
        } finally {
          setIsCheckingSubdomain(false);
        }
      }
    };

    checkSubdomain();
  }, [debouncedSubdomain, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const response = await submitData(
        `${routes.auth}/register-reseller`,
        null,
        {
          user: {
            email: values.email,
            password: values.password,
            name: values.name,
          },
          reseller: {
            name: values.companyName,
            key: values.subdomain,
            cui: values.cui,
          }
        }
      );

      if (response.error) {
        toast({
          variant: "destructive",
          title: tMessages("genericError"),
          description: tAuth(response.error.message),
        });
      } else {
        toast({
          title: tForm("success") || "Success",
          description: tForm("resellerCreated") || "Your reseller account has been created. You can now log in.",
        });

        router.push("/auth/login");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: tForm("error") || "Error",
        description: tAuth(error.message) || tForm("resellerCreateFailed") || "Failed to create reseller account",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
        <div className="mb-6">
            <h2 className="text-2xl font-bold">{t("reseller")}</h2>
            <p className="text-muted-foreground">{t("createReseller")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("email") || "Email"}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("emailPlaceholder") || "email@example.com"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("fullName") || "Full Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("fullNamePlaceholder") || "John Doe"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("companyName") || "Company Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("companyNamePlaceholder") || "Your Company"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("subdomain") || "Subdomain"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder={tForm("subdomainPlaceholder") || "your-company"}
                        {...field} 
                        className={
                            subdomainExists === false 
                            ? "border-green-500 focus-visible:ring-green-500" 
                            : subdomainExists === true 
                              ? "border-red-500 focus-visible:ring-red-500" 
                              : ""
                        }
                      />
                      <span>.mediabank.ro</span>
                    </div>
                  </FormControl>
                  {isCheckingSubdomain && <p className="text-sm text-muted-foreground">{tForm("checkingSubdomain") || "Checking availability..."}</p>}
                  {subdomainExists === false && <p className="text-sm text-green-500">{tForm("subdomainAvailable") || "Subdomain is available"}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cui"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("cui") || "CUI"}</FormLabel>
                  <FormControl>
                    <Input placeholder={tForm("cuiPlaceholder") || "Company Identification Number"} {...field} />
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
                  <FormLabel>{tForm("password") || "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("confirmPassword") || "Confirm Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isCheckingSubdomain || subdomainExists === true}
            >
              {isSubmitting ? 
                (tForm("creatingAccount") || "Creating account...") : 
                (tForm("createAccount") || "Create Account")}
            </Button>
          </form>
        </Form>
    </div>
  );
}