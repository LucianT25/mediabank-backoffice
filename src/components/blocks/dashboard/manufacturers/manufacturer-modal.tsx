"use client"
import React, { FC } from 'react';
import { useTranslations } from 'next-intl';
import { Manufacturer } from '@/interfaces/manufacturer.interface';
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalDescription,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export interface ManufacturerModalProps {
    manufacturer: Partial<Manufacturer>,
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (manufacturer: Manufacturer) => void,
    onDelete?: (id: string) => void,
}

const ManufacturerModal: FC<ManufacturerModalProps> = ({ manufacturer, isOpen, onOpenChange, onSubmit, onDelete }) => {
    const t = useTranslations('Manufacturers.Modal');
    
    const formSchema = z.object({
        id: z.string().optional(),
        key: z.string().min(2, t('validation.keyMinLength'))
        .regex(/^[a-z0-9-]+$/, t('validation.keyFormat')),
        name: z.string().min(2, t('validation.nameMinLength')),
        address: z.string().min(2, t('validation.addressMinLength')),
        website: z.string().url(t('validation.websiteFormat')).optional().or(z.literal('')),
        active: z.boolean().default(true),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            id: manufacturer.id ?? '',
            key: manufacturer.key ?? '',
            name: manufacturer.name ?? '',
            address: manufacturer.address ?? '',
            website: manufacturer.website ?? '',
            active: manufacturer.active ?? true,
        },
    });

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values as Manufacturer);
    }

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        <div className="flex flex-col">
                            <span>{manufacturer.name}</span>
                            <span className="text-sm font-light">{t('manufacturerDetails')}</span>
                        </div>
                    </ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        {t('editManufacturerDetails')}
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitValue)} className="space-y-8">
                        {manufacturer.id && (
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.id')}</FormLabel>
                                        <FormControl>
                                            <Input disabled placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.key')}</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder={t('placeholders.enterManufacturerKey')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholders.enterManufacturerName')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.address')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholders.enterManufacturerAddress')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.website')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholders.enterManufacturerWebsite')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t('fields.activeStatus')}</FormLabel>
                                        <FormDescription>
                                            {t('descriptions.activeStatus')}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex">
                            {manufacturer.id && onDelete ? (
                                <Button variant="destructive" onClick={(e) => {
                                    e.preventDefault();
                                    onDelete(manufacturer.id ?? '');
                                }}>
                                    {t('buttons.delete')}
                                </Button>
                            ) : ''}
                            <Button type="submit" className="ml-auto">
                                {t('buttons.saveChanges')}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default ManufacturerModal;
