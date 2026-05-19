"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { StatusHistory as StatusHistoryType } from "@/interfaces/order.interface";

interface StatusHistoryProps {
    statusHistory: StatusHistoryType[];
    translationNamespace?: string;
    onAddStatus?: () => void;
}

export function StatusHistory({ statusHistory, translationNamespace, onAddStatus }: StatusHistoryProps) {
    const t = useTranslations(translationNamespace);

    return (
        <Card>
            <Collapsible className="group" defaultOpen={statusHistory.length < 5}>
                <CardHeader>
                    <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-gray-50 rounded-md p-2">
                        <CardTitle className="text-left flex items-center gap-2">
                            {t('statusHistory')}
                            <span className="text-sm font-normal text-muted-foreground">
                                {statusHistory.length} {t('entries', {count: statusHistory.length})}
                            </span>
                        </CardTitle>
                        <div className="flex gap-4 items-center">
                            <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <table className="w-full text-sm rounded-md border border-separate border-spacing-0">
                                <thead className="border-b">
                                    <tr className="text-left bg-slate-50">
                                        <th className="p-2 border-b rounded-tl-lg">{t('timestamp')}</th>
                                        <th className="p-2 border-b rounded-tr-lg">{t('statusDetails')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statusHistory.map((status, index) => (
                                        <tr key={index}>
                                            <td className="p-2">
                                                {formatDate(status.date)}
                                            </td>
                                            <td className="p-2">{status.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {onAddStatus && (
                            <Button onClick={(e) => { e.stopPropagation(); onAddStatus(); }} className="w-fit ml-auto">
                                {t('addStatus')}
                            </Button>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
