"use client"

import {Order, OrderStatus} from "@/interfaces/order.interface";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    MapPinIcon,
    PackageIcon,
    PenLineIcon,
    TruckIcon
} from "lucide-react";
import {formatDate, isWithin24Hours} from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {routes, submitData} from "@/lib/fetcher";
import {useSession} from "next-auth/react";
import {refreshData} from "@/lib/server-actions";
import {useToast} from "@/hooks/use-toast";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";
import {Label} from "@/components/ui/label";
import {useMemo, useState} from "react";
import {FulfillmentItem} from "@/components/blocks/dashboard/orders/fulfillment-item";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { StatusHistory } from "@/components/blocks/dashboard/orders/status-history";
import { Documents } from "@/components/blocks/dashboard/orders/documents";
import DocumentModal from "@/components/blocks/dashboard/orders/document-modal";

export function OrderDetails({order}: { order: Order }) {
    const { toast } = useToast();
    const {data: session } = useSession();
    const role = useMemo(() => (session?.user as any)?.role, [session]);
    const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
    const t = useTranslations('Orders.Details');
    const tMessages = useTranslations('Messages');

    const updateStatus = async (status: string, changeRequest?: boolean) => {
        let response;

        try {
            if (changeRequest) {
                response = await submitData(`${routes.order}/review-changes/${order?.id}`, (session as any).accessToken, {
                    id: order?.id,
                    status,
                    updatedAt: order.updatedAt
                });
            } else {
                response = await submitData(`${routes.order}/${order?.id}`, (session as any).accessToken, {
                    id: order?.id,
                    status,
                });
            }

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: t('somethingWentWrong'),
                });
                console.error(response.error);
            } else {
                toast({
                    title: tMessages('success'),
                    description: changeRequest ? t('changesStatus', { status }) : t('statusUpdated')
                });
                await refreshData(`${routes.order}/${order?.id}`)
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: t('somethingWentWrong'),
            });
        }
    }

    const uploadDocument = async (file: File, type: string) => {
        let response;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            
            response = await submitData(`${routes.order}/documents/upload/${order?.id}`, (session as any).accessToken, formData);

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: tMessages('somethingWentWrong'),
                });
                console.log(response.error);
            } else {
                toast({
                    title: tMessages('success'),
                    description: t('documentUploaded')
                });
                setUploadDocumentModalOpen(false);
                await refreshData(`${routes.order}/${order?.id}`)
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: tMessages('somethingWentWrong'),
            });
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col gap-4">
            <DocumentModal
                isOpen={uploadDocumentModalOpen}
                onOpenChange={setUploadDocumentModalOpen}
                onSubmit={uploadDocument}
            />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{t('orderDetails')}</h1>
                    <p className="text-muted-foreground">{t('orderId')}: {order.id}</p>
                </div>
                <div className="flex gap-2 items-center mt-4 md:mt-0">
                    <Label>{t('status')}</Label>
                    <Select
                        onValueChange={(value) => updateStatus(value)}
                        defaultValue={order.status}
                    >
                        <SelectTrigger className="flex-1 text-sm w-32">
                            <SelectValue placeholder={t('pleaseSelect')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(OrderStatus).map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                        </SelectContent>
                    </Select>
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
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('email')}</span>
                            <span>{order.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('total')}</span>
                            <span className="font-semibold">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('shippingMethod')}</span>
                            <span>{order.shippingMethod}</span>
                        </div>
                        {role === 'super' && <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('reseller')}</span>
                            <span>{order.reseller?.name}</span>
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
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.county} {order.shippingAddress.postCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            <p className="pt-2">{t('phone')}: {order.shippingAddress.phone}</p>
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
                                {order.billingAddress.firstName} {order.billingAddress.lastName}
                            </p>
                            <p>{order.billingAddress.line1}</p>
                            {order.billingAddress.line2 && <p>{order.billingAddress.line2}</p>}
                            <p>
                                {order.billingAddress.city}, {order.billingAddress.county} {order.billingAddress.postCode}
                            </p>
                            <p>{order.billingAddress.country}</p>
                            <p className="pt-2">{t('phone')}: {order.billingAddress.phone}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {(order.status === OrderStatus.manufacturerChanges && isWithin24Hours(order.createdAt)) &&
                <Card className="border-2 border-yellow-200">
                    <CardHeader className="bg-yellow-50">
                        <CardTitle className="flex items-center gap-2">
                            <PenLineIcon className="h-5 w-5"/>
                            {t('approveChangesTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{t('reviewChangesMessage')}</p>
                            <div className="flex gap-4">
                                <Button variant="default" onClick={() => updateStatus('approved', true)}>{t('approve')}</Button>
                                <Button variant="destructive" onClick={() => updateStatus('declined', true)}>{t('decline')}</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            }

            {/* Status History */}
            <StatusHistory 
                statusHistory={order.statusHistory} 
                translationNamespace={'Orders.Details'}
            />

            <Documents
                documents={order.documents}
                onUploadDocument={() => setUploadDocumentModalOpen(true)}
            />

            {/* Fulfillment Information */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('fulfillmentInformation')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.fulfillments.map((fulfillment, index) => (
                        <div key={`fulfillment-${index}`}>
                            <div className="font-bold mb-2">#{index + 1}</div>
                            <FulfillmentItem fulfillment={fulfillment}/>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>)
}