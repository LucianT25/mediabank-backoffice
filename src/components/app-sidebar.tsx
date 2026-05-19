"use client"

import * as React from "react"
import {
    ChartBar, MessageCircle,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail, useSidebar,
} from "@/components/ui/sidebar"
import {useSession} from "next-auth/react";
import {ColourfulText} from "@/components/ui/colourful-text";
import Link from "next/link";
import {AdminType} from "@/interfaces/user.interface";
import { useTranslations } from "next-intl";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {data: session} = useSession();
    const user = session?.user;
    const {open} = useSidebar();
    const t = useTranslations('Sidebar');

    const data = {
        navSuper: [
            {
                title: t('management'),
                url: "#",
                icon: SquareTerminal,
                isActive: true,
                items: [
                    {
                        title: t('admins'),
                        url: "/dashboard/admins",
                    },
                    {
                        title: t('buyers'),
                        url: "/dashboard/buyers",
                    },
                    {
                        title: t('resellers'),
                        url: "/dashboard/resellers",
                    },
                    {
                        title: t('manufacturers'),
                        url: "/dashboard/manufacturers",
                    },
                    {
                        title: t('orders'),
                        url: "/dashboard/orders",
                    },
                ],
            },
        ],
        navReseller: [
            {
                title: t('management'),
                url: "#",
                icon: SquareTerminal,
                isActive: true,
                items: [
                    {
                        title: t('orders'),
                        url: "/dashboard/orders",
                    },
                    {
                        title: t('buyers'),
                        url: "/dashboard/buyers",
                    },
                    {
                        title: t('products'),
                        url: "/dashboard/product-catalog",
                    },
                ],
            },
            {
                title: t('chat'),
                url: "#",
                icon: MessageCircle,
                isActive: true,
            },
            {
                title: t('financial'),
                url: "#",
                icon: ChartBar,
                items: [
                    {
                        title: t('stripe'),
                        url: "/dashboard/stripe",
                    },
                ],
            },
        ],
        navManufacturer: [
            {
                title: t('management'),
                url: "#",
                icon: SquareTerminal,
                isActive: true,
                items: [
                    {
                        title: t('orderFulfillments'),
                        url: "/dashboard/order-fulfillments",
                    },
                    {
                        title: t('products'),
                        url: "/dashboard/products",
                    },
                    {
                        title: t('materials'),
                        url: "/dashboard/materials",
                    },
                ],
            },
        ],
        navMain: [
            {
                title: t('settings'),
                url: "#",
                icon: Settings2,
                items: [
                    {
                        title: t('general'),
                        url: "#",
                    },
                    {
                        title: t('account'),
                        url: "#",
                    },
                ],
            },
        ],
    }

    let itemsPerRole: Array<{ title: string; url: string; icon?: any; isActive?: boolean; items?: Array<{ title: string; url: string }> }> = []

    if (user) {
        itemsPerRole = (user as any)?.role === AdminType.Super
            ? data.navSuper
            : ((user as any).role === AdminType.Reseller
                ? data.navReseller
                : data.navManufacturer);
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {/*<TeamSwitcher teams={data.teams} />*/}
                <Link href="/dashboard" className={open ? "px-2 pb-2" : 'pb-2'}>
                  <span
                      className={`text-center text-2xl font-semibold ${open ? 'visible' : 'hidden'} overflow-hidden text-nowrap`}>
                    Media<ColourfulText text="bank"/>
                  </span>
                    <span className={`text-center text-2xl font-semibold ${open ? 'hidden' : 'visible'}`}>
                    M<ColourfulText text="B"/>
                  </span>
                  {/*  <Image src='/simulator.jpg' width={100} height={100}/>*/}
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={[...itemsPerRole, ...data.navMain]}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
