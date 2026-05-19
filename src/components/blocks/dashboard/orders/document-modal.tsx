"use client"

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ResponsiveModal, ResponsiveModalContent, ResponsiveModalDescription, ResponsiveModalHeader, ResponsiveModalTitle } from "@/components/ui/responsive-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslations } from 'next-intl';
import * as z from "zod";
import { UploadIcon } from "lucide-react";
import { DocumentType } from "@/interfaces/order.interface";

export interface DocumentModalProps {
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (file: File, type: string) => void
}

const DocumentModal: FC<DocumentModalProps> = ({ isOpen, onOpenChange, onSubmit }) => {
    const t = useTranslations('Documents.Upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const formSchema = z.object({
        type: z.string()
            .min(1, t('validation.typeRequired')),
        file: z.instanceof(File, { message: t('validation.fileRequired') })
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: '',
            file: undefined
        }
    })

    useEffect(() => {
        if (isOpen) {
            form.reset({ type: '', file: undefined });
            setSelectedFile(null);
        }
    }, [isOpen, form]);

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setSelectedFile(file);
            form.setValue('file', file);
            form.clearErrors('file');
        }
    };

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values.file, values.type);
    }

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        {t('title')}
                    </ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        {t('description')}
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitValue)}>
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('fields.type')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('fields.typePlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(DocumentType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {t(`types.${type}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t('fields.file')}</FormLabel>
                                    <FormControl>
                                        <Dropzone
                                            onDrop={handleFileSelect}
                                            accept={{
                                                'image/*': ['.png', '.jpg', '.jpeg'],
                                                'application/pdf': ['.pdf'],
                                                'application/msword': ['.doc'],
                                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                            }}
                                            maxFiles={1}
                                            maxSize={10 * 1024 * 1024} // 10MB
                                            src={selectedFile ? [selectedFile] : undefined}
                                        >
                                            <DropzoneContent />
                                            <DropzoneEmptyState>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                        <UploadIcon size={16} />
                                                    </div>
                                                    <p className="my-2 w-full truncate text-wrap font-medium text-sm">
                                                        {t('dropzone.uploadFile')}
                                                    </p>
                                                    <p className="w-full truncate text-wrap text-muted-foreground text-xs">
                                                        {t('dropzone.dragAndDrop')}
                                                    </p>
                                                    <p className="text-wrap text-muted-foreground text-xs">
                                                        {t('dropzone.acceptedFormats')}
                                                    </p>
                                                </div>
                                            </DropzoneEmptyState>
                                        </Dropzone>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit">{t('buttons.upload')}</Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default DocumentModal;
