"use client"

import { Badge } from "@/components/ui/badge";
import { OrderFulfillmentItemStatus } from "@/interfaces/order-fulfillment.interface";
import { OrderStatus } from "@/interfaces/order.interface";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface BadgeInfo {
    color: string | null,
    icon: React.ReactNode | null,
    text: string | null
}

export function StatusBadge ({status}: {status: OrderStatus | OrderFulfillmentItemStatus}) {
    const t = useTranslations('StatusBadge');

    let badgeInfo: BadgeInfo = {
        color: null,
        icon: null,
        text: null
    };

    switch (status) {
        case OrderStatus.paid:
        case OrderStatus.done:
        case OrderStatus.approved:
        case OrderStatus.shipped:
        case OrderFulfillmentItemStatus.DONE:
        case OrderFulfillmentItemStatus.SHIPPED:
            badgeInfo = {
                color: 'bg-green-500',
                icon: <CheckCircle className="h-4 w-4 mr-1" />,
                text: t(status)
            };
            break;
        case OrderStatus.manufacturerChanges:
        case OrderStatus.awaitingPayment:
        case OrderStatus.inProgress:
        case OrderStatus.customQuote:
        case OrderFulfillmentItemStatus.IN_PROGRESS:
        case OrderFulfillmentItemStatus.PENDING:
            badgeInfo = {
                color: 'bg-yellow-500',
                icon: <AlertCircle className="h-4 w-4 mr-1" />,
                text: t(status)
            };
            break;
        case OrderStatus.cancelled:
        case OrderStatus.declined:
        case OrderFulfillmentItemStatus.CANCELLED:
            badgeInfo = {
                color: 'bg-red-500',
                icon: <XCircle className="h-4 w-4 mr-1" />,
                text: t(status)
            };
            break;
    }

    return <Badge className={`${badgeInfo.color} text-white inline-flex items-center justify-center rounded-sm p-1 pointer-events-none w-fit`}>
                {badgeInfo.icon}
                {badgeInfo.text}
            </Badge>;
}
