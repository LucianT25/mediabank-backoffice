"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Document } from "@/interfaces/order.interface";
import { clientFetch, routes } from "@/lib/fetcher";
import { useSession } from "next-auth/react";

interface DocumentsProps {
    documents?: Document[] | null;
    onUploadDocument?: () => void;
}

export function Documents({ documents, onUploadDocument }: DocumentsProps) {
    const { toast } = useToast();
    const {data: session } = useSession();
    const t = useTranslations('Documents');
    const tMessages = useTranslations('Messages');

    const handleViewDocument = async (file: Document) => {
        let response;

        try {
            response = await clientFetch(`${routes.order}/documents/download/${file.key}`, (session as any).accessToken);

            if (response.error) {
                toast({
                    variant: 'destructive',
                    title: tMessages('genericError'),
                    description: tMessages('somethingWentWrong'),
                });
                console.log(response.error);
            } else {
                window.open(response.data.url, '_blank')
            }
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: tMessages('genericError'),
                description: tMessages('somethingWentWrong'),
            });
        }
    };

    return (
        <Card>
            <Collapsible className="group" defaultOpen={(documents?.length ?? 0) < 5 && (documents?.length ?? 0) !== 0}>
                <CardHeader>
                    <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-gray-50 rounded-md p-2">
                        <CardTitle className="text-left flex items-center gap-2">
                            {t('documents')}
                            <span className="text-sm font-normal text-muted-foreground">
                                {documents?.length || 0} {t('entries', {count: documents?.length || 0})}
                            </span>
                        </CardTitle>
                        <div className="flex gap-4 items-center">
                            {onUploadDocument && (
                                <Button onClick={(e) => { e.stopPropagation(); onUploadDocument(); }}>
                                    {t('uploadDocument')}
                                </Button>
                            )}
                            <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        {!documents || documents.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                {t('noDocuments')}
                            </div>
                        ) : (
                            <div>
                                <table className="w-full text-sm rounded-md border border-separate border-spacing-0">
                                    <thead className="border-b">
                                        <tr className="text-left bg-slate-50">
                                            <th className="p-2 border-b rounded-tl-lg">{t('name')}</th>
                                            <th className="p-2 border-b">{t('type')}</th>
                                            <th className="p-2 border-b rounded-tr-lg">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents?.map((document, index) => (
                                            <tr key={index}>
                                                <td className="p-2">
                                                    {document.name}
                                                </td>
                                                <td className="p-2">
                                                    {t(`Upload.types.${document.type}`)}
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDocument(document)}
                                                    >
                                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                                        {t('view')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
