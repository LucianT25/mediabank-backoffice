"use client"

import { IflowsSyncStatus, Order, OrderStatus } from "@/interfaces/order.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, RefreshCw, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { routes, submitData } from "@/lib/fetcher";
import { refreshData } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export function IflowsSyncCard({ order }: { order: Order }) {
    const { toast } = useToast();
    const { data: session } = useSession();
    const t = useTranslations('Orders.Details.Iflows');
    const tMessages = useTranslations('Messages');
    const [syncing, setSyncing] = useState(false);

    const canSync =
        order.status === OrderStatus.paid &&
        order.iflowsSyncStatus !== IflowsSyncStatus.paid;

    const retrySync = async () => {
        setSyncing(true);
        try {
            const response = await submitData(
                `${routes.order}/sync-iflows/${order.id}`,
                (session as any).accessToken,
                {},
            );

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: response.error?.message ?? t('syncFailed'),
                });
            } else if (response.data?.success) {
                toast({
                    title: tMessages('success'),
                    description: t('syncSucceeded'),
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: response.data?.error ?? t('syncFailed'),
                });
            }

            await refreshData(`${routes.order}/${order.id}`);
        } catch {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: t('syncFailed'),
            });
        } finally {
            setSyncing(false);
        }
    };

    const statusBadge = () => {
        if (order.iflowsSyncStatus === IflowsSyncStatus.paid) {
            return (
                <Badge className="bg-green-600 text-white hover:bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {t('statusSynced')}
                </Badge>
            );
        }
        if (order.iflowsSyncStatus === IflowsSyncStatus.failed) {
            return (
                <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    {t('statusFailed')}
                </Badge>
            );
        }
        if (order.status !== OrderStatus.paid) {
            return (
                <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {t('statusNotApplicable')}
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                <Clock className="mr-1 h-3 w-3" />
                {t('statusPending')}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{t('title')}</CardTitle>
                {canSync && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={retrySync}
                        disabled={syncing}
                    >
                        {syncing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {t('retrySync')}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('syncStatus')}</span>
                    {statusBadge()}
                </div>

                {order.iflowsOrderId && (
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('iflowsOrderId')}</span>
                        <span className="font-mono text-sm">{order.iflowsOrderId}</span>
                    </div>
                )}

                {order.iflowsLastSyncError && (
                    <Alert variant="destructive">
                        <AlertDescription className="break-words">
                            <span className="font-medium">{t('syncError')}: </span>
                            {order.iflowsLastSyncError}
                        </AlertDescription>
                    </Alert>
                )}

                {order.status !== OrderStatus.paid && (
                    <p className="text-sm text-muted-foreground">{t('paidRequired')}</p>
                )}
            </CardContent>
        </Card>
    );
}
