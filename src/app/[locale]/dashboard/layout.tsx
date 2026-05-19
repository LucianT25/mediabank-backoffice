import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {DynamicBreadcrumb} from "@/components/ui/dynamic-breadcrumb";
import { routes, serverFetch } from '@/lib/fetcher';
import React from 'react';
import { DataProvider } from '@/context/data-context';
import { LanguagePicker } from "@/components/ui/language-picker";

export default async function DashboardLayout ({children} : {children: React.ReactNode}) {
  const reseller = await serverFetch(routes.reseller + `/user`);

  return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex w-full items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex w-full items-center justify-between">
                          <DynamicBreadcrumb />
                          <LanguagePicker />
                        </div>
                    </div>
                </header>
              <DataProvider data={{reseller: reseller?.data}}>
                {children}
              </DataProvider>
            </SidebarInset>
        </SidebarProvider>
    )
}
