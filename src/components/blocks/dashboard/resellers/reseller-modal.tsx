"use client"

import React, { FC } from 'react';
import { useTranslations } from 'next-intl';
import { Reseller } from '@/interfaces/reseller.interface';
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Manufacturer } from '@/interfaces/manufacturer.interface';
import MultiSelect from '@/components/ui/multi-select';

export interface ResellerModalProps {
    reseller: Partial<Reseller>,
    manufacturers: Manufacturer[]
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (reseller: Reseller) => void,
    onDelete?: (id: string) => void,
}

const ResellerModal: FC<ResellerModalProps> = ({ reseller, manufacturers, isOpen, onOpenChange, onSubmit, onDelete }) => {
    const t = useTranslations('Resellers.Modal');
    
    const formSchema = z.object({
        id: z.string().optional(),
        name: z.string().min(1, t('validation.nameRequired')),
        stripeOnboarded: z.boolean().default(false),
        stripeAccountId: z.string().optional(),
        manufacturers: z.array(z.any()).optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            id: reseller.id ?? '',
            name: reseller.name ?? '',
            stripeOnboarded: reseller.stripeOnboarded ?? false,
            stripeAccountId: reseller.stripeAccountId ?? '',
            manufacturers: reseller.manufacturers?.map(m => m.id) ?? [],
        },
    });

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values as Reseller);
    }

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        <div className="flex flex-col">
                            <span>{reseller.name || t('newReseller')}</span>
                            <span className="text-sm font-light">{t('resellerDetails')}</span>
                        </div>
                    </ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        {reseller.id ? t('editResellerDetails') : t('createNewReseller')}
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitValue)} className="space-y-8">
                        {reseller.id && (
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholders.enterResellerName')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="manufacturers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.manufacturers')}</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={manufacturers.map(manufacturer => ({
                                                label: manufacturer.name,
                                                value: manufacturer.id
                                            }))}
                                            value={field.value?.map(manufacturerId => {
                                                const manufacturer = manufacturers.find(m => m.id === manufacturerId);
                                                return {
                                                    label: manufacturer?.name || manufacturerId,
                                                    value: manufacturerId
                                                };
                                            }) || []}
                                            onChange={(selectedOptions) => {
                                                field.onChange(selectedOptions.map(option => option.value));
                                            }}
                                            placeholder={t('placeholders.selectManufacturers')}
                                            hidePlaceholderWhenSelected
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stripeAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.stripeAccountId')}</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder={t('placeholders.enterStripeAccountId')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stripeOnboarded"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            disabled
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            {t('fields.stripeOnboarded')}
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex">
                            {reseller.id && onDelete ? (
                                <Button variant="destructive" onClick={(e) => {
                                    e.preventDefault();
                                    onDelete(reseller.id ?? '');
                                }}>
                                    {t('buttons.delete')}
                                </Button>
                            ) : ''}
                            <Button type="submit" className="ml-auto">
                                {reseller.id ? t('buttons.saveChanges') : t('buttons.createReseller')}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default ResellerModal;
