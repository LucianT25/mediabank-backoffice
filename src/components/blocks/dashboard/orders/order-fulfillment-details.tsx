"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    MapPinIcon,
    PackageIcon,
    TruckIcon
} from "lucide-react";
import {formatDate} from "@/lib/utils";
import {clientFetch, routes, submitData} from "@/lib/fetcher";
import {useSession} from "next-auth/react";
import {refreshData} from "@/lib/server-actions";
import {useToast} from "@/hooks/use-toast";
import * as React from "react";
import {Label} from "@/components/ui/label";
import {useMemo, useState} from "react";
import {FulfillmentItem} from "@/components/blocks/dashboard/orders/fulfillment-item";
import {OrderFulfillment} from "@/interfaces/order-fulfillment.interface";
import { FulfillmentChangesForm } from "./fulfillment-changes-form";
import { StatusBadge } from "@/components/ui/status-badge";
import AddStatusModal from "./add-status-modal";
import { useTranslations } from "next-intl";
import { StatusHistory } from "@/components/blocks/dashboard/orders/status-history";
import { Documents } from "./documents";
import { Button } from "@/components/ui/button";

export function OrderFulfillmentDetails({orderFulfillment}: { orderFulfillment: OrderFulfillment }) {
    const { toast } = useToast();
    const t = useTranslations('Fulfillments.Details');
    const tMessages = useTranslations('Messages');
    const {data: session } = useSession();
    const role = useMemo(() => (session?.user as any)?.role, [session]);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const updateItemStatus = async (itemId: string, status: string) => {
        let response;

        try {
            response = await submitData(`${routes.orderFulfillment}/item/${itemId}`, (session as any).accessToken, {
                id: itemId,
                status,
            });

            if (response.error) {
                toast({
                    variant: 'default',
                    title: tMessages('genericError'),
                    description: tMessages('somethingWentWrong'),
                });
                console.error(response.error);
            } else {
                toast({
                    variant: 'default',
                    title: tMessages('success'),
                    description: t('statusUpdated')
                });
                await refreshData(`${routes.order}/${orderFulfillment?.id}`)
            }
        } catch (e: any) {
            toast({
                variant: 'default',
                title: tMessages('genericError'),
                description: tMessages('somethingWentWrong'),
            });
        }
    }

    const handleChangesForm = async (data: any) => {
        let response;

        try {
            response = await submitData(
                `${routes.orderFulfillment}/manufacturer-changes/${orderFulfillment.id}`,
                (session as any).accessToken,
                {
                    id: orderFulfillment.id,
                    orderId: orderFulfillment.order.id,
                    orderUpdatedAt: orderFulfillment.order.updatedAt,
                    ...data,
                }
            );

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
                console.error(response.error);
            } else {
                toast({
                    title: tMessages('success'),
                    description: t('changesSubmitted')
                });
                await refreshData(`${routes.order}/${orderFulfillment?.id}`)
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: response?.error.message,
            });
        }
    }

    const submitStatusModal = async (message: string) => {
        let response;

        try {
            response = await submitData(`${routes.order}/status-message/${orderFulfillment.order.id}`,
                (session as any).accessToken,
                {
                    message
                }
            )

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
                console.error(response.error);
            } else {
                toast({
                    title: tMessages('success'),
                    description: t('messageSubmitted')
                });
                setStatusModalOpen(false);
                await refreshData(`${routes.order}/${orderFulfillment?.id}`)
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: response?.error.message,
            });
        }
    }

    const exportBillableMaterials = async (orderFulfillment: OrderFulfillment) => {
        let response;

        try {
            response = await clientFetch(`${routes.orderFulfillment}/billable-materials/${orderFulfillment.id}`,
                (session as any).accessToken,
            )

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
                console.error(response.error);
            } else {
                if (response.data && response.data.type === 'Buffer' && response.data.data) {
                    const uint8Array = new Uint8Array(response.data.data);
                    const blob = new Blob([uint8Array], { type: 'application/pdf' });
                    
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `billable-materials-${orderFulfillment.id}.pdf`;
                    
                    document.body.appendChild(link);
                    link.click();
                    
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }
                
                toast({
                    title: tMessages('success'),
                    description: t('billableMaterialsExported')
                });
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: response?.error.message,
            });
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col gap-4">
            <AddStatusModal
                isOpen={statusModalOpen}
                onOpenChange={setStatusModalOpen}
                onSubmit={submitStatusModal}
            />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{t('orderFulfillmentDetails')}</h1>
                    <p className="text-muted-foreground">{t('orderFulfillmentId')}: {orderFulfillment.id}</p>
                    <p className="text-muted-foreground">{t('orderId')}: {orderFulfillment.order.id}</p>
                </div>
                <div className="flex gap-2 items-center mt-4 md:mt-0">
                    <Label>{t('status')}</Label>
                    <StatusBadge status={orderFulfillment.order.status}/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="h-5 w-5"/>
                            {t('orderSummary')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('orderDate')}</span>
                            <span>{formatDate(orderFulfillment.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('email')}</span>
                            <span>{orderFulfillment.order.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('total')}</span>
                            <span className="font-semibold">${Number(orderFulfillment.order.total)?.toFixed(2) ?? '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('shippingMethod')}</span>
                            <span>{orderFulfillment.order.shippingMethod}</span>
                        </div>
                        {orderFulfillment.order?.deliveryDate && <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('deliveryDate')}</span>
                            <span>{formatDate(orderFulfillment.order.deliveryDate)}</span>
                        </div>}
                        {role === 'super' && <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('reseller')}</span>
                            <span>{orderFulfillment.order.reseller.name}</span>
                        </div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TruckIcon className="h-5 w-5"/>
                            {t('shippingAddress')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="font-medium">
                                {orderFulfillment.order.shippingAddress.firstName} {orderFulfillment.order.shippingAddress.lastName}
                            </p>
                            <p>{orderFulfillment.order.shippingAddress.line1}</p>
                            {orderFulfillment.order.shippingAddress.line2 && <p>{orderFulfillment.order.shippingAddress.line2}</p>}
                            <p>
                                {orderFulfillment.order.shippingAddress.city}, {orderFulfillment.order.shippingAddress.county} {orderFulfillment.order.shippingAddress.postCode}
                            </p>
                            <p>{orderFulfillment.order.shippingAddress.country}</p>
                            <p className="pt-2">{t('phone')}: {orderFulfillment.order.shippingAddress.phone}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5"/>
                            {t('billingAddress')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="font-medium">
                                {orderFulfillment.order.billingAddress.firstName} {orderFulfillment.order.billingAddress.lastName}
                            </p>
                            <p>{orderFulfillment.order.billingAddress.line1}</p>
                            {orderFulfillment.order.billingAddress.line2 && <p>{orderFulfillment.order.billingAddress.line2}</p>}
                            <p>
                                {orderFulfillment.order.billingAddress.city}, {orderFulfillment.order.billingAddress.county} {orderFulfillment.order.billingAddress.postCode}
                            </p>
                            <p>{orderFulfillment.order.billingAddress.country}</p>
                            <p className="pt-2">{t('phone')}: {orderFulfillment.order.billingAddress.phone}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status History */}
            <StatusHistory
                statusHistory={orderFulfillment.order.statusHistory} 
                translationNamespace={'Fulfillments.Details'}
                onAddStatus={() => setStatusModalOpen(true)}
            />

            <Documents
                documents={orderFulfillment.order.documents}
            />

            {/* Price and Deadline Adjustment */}
            <FulfillmentChangesForm fulfillment={orderFulfillment} onSubmit={handleChangesForm}/>

            {/* Fulfillment Information */}
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <CardTitle>{t('fulfillmentInformation')}</CardTitle>
                    <Button onClick={() => exportBillableMaterials(orderFulfillment)}>{t('exportBillableMaterials')}</Button>
                </CardHeader>
                <CardContent>
                    <FulfillmentItem fulfillment={orderFulfillment} onStatusUpdate={updateItemStatus}/>
                </CardContent>
            </Card>
        </div>)}
