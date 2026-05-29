"use client"

import * as React from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatsResponse } from "@/interfaces/stats.interface";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { ClockIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { AdminType } from "@/interfaces/user.interface";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatisticsProps {
    stats: StatsResponse
}

export const Statistics: React.FC<StatisticsProps> = ({stats}) => {
    const {data: session} = useSession();
    const userRole = (session?.user as any)?.role || AdminType.Super;
    const t = useTranslations('Statistics');
    
    const roleConfig = {
        [AdminType.Super]: {
            newOrdersTitle: t('super.newOrdersTitle'),
            totalOrdersTitle: t('super.totalOrdersTitle'),
            revenueTitle: t('super.revenueTitle'),
            ordersTitle: t('super.ordersTitle'),
            ordersDescription: t('super.ordersDescription'),
            orderLinkPrefix: "/dashboard/orders/"
        },
        [AdminType.Reseller]: {
            newOrdersTitle: t('reseller.newOrdersTitle'),
            totalOrdersTitle: t('reseller.totalOrdersTitle'),
            revenueTitle: t('reseller.revenueTitle'),
            ordersTitle: t('reseller.ordersTitle'),
            ordersDescription: t('reseller.ordersDescription'),
            orderLinkPrefix: "/dashboard/orders/"
        },
        [AdminType.Manufacturer]: {
            newOrdersTitle: t('manufacturer.newOrdersTitle'),
            totalOrdersTitle: t('manufacturer.totalOrdersTitle'),
            revenueTitle: t('manufacturer.revenueTitle'),
            ordersTitle: t('manufacturer.ordersTitle'),
            ordersDescription: t('manufacturer.ordersDescription'),
            orderLinkPrefix: "/dashboard/order-fulfillments/"
        }
    };
    
    const config = roleConfig[userRole as AdminType] || roleConfig[AdminType.Super];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-4">

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{config.newOrdersTitle}</CardTitle>
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            <AnimatedNumber value={stats?.newItems?.length || 0} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{config.totalOrdersTitle}</CardTitle>
                        <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                            {stats?.itemGrowth?.percentIncrease < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                            ) : (
                                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                            )}
                            <span className={`text-xs ${stats?.itemGrowth?.percentIncrease < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {stats?.itemGrowth?.percentIncrease}%
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            <AnimatedNumber value={stats?.totalItems || 0} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('last30Days')}: {stats?.itemGrowth?.previous || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{config.revenueTitle}</CardTitle>
                        <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                            {stats?.revenueGrowth?.percentIncrease < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                            ) : (
                                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                            )}
                            <span className={`text-xs ${stats?.revenueGrowth?.percentIncrease < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {stats?.revenueGrowth?.percentIncrease}%
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            <AnimatedNumber value={stats?.totalRevenue || 0} prefix="€" decimals={2} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('last30Days')}: {formatCurrency(stats?.revenueGrowth?.previous)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
                <Card>
                    <CardHeader>
                        <CardTitle>{config.ordersTitle}</CardTitle>
                        <CardDescription>{config.ordersDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="p-1">
                            <div className="grid gap-4 max-h-[30vh]">
                                {stats?.newItems && stats.newItems.length > 0 ? (
                                    stats.newItems.map((order) => (
                                        <Link href={`${config.orderLinkPrefix}${order.id}`} key={order.id}>
                                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <CardHeader className="p-4">
                                                    <CardTitle className="flex flex-row justify-between">
                                                        <div className="text-sm">
                                                            {t('orderNumber', { number: order.number })}
                                                        </div>
                                                        <StatusBadge status={order.status} />
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 flex flex-row justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{order.email}</p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm mt-2 font-bold">
                                                        {formatCurrency(order.total)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {t('noNewOrders')}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
