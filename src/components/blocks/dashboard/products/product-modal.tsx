"use client"

import React, { FC } from 'react';
import { useTranslations } from 'next-intl';
import { ProductResponse } from '@/interfaces/product.interface';
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

export interface ProductModalProps {
    productResponse: Partial<ProductResponse>,
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (productResponse: ProductResponse) => void,
    onDelete?: (id: string) => void,
}

const ProductModal: FC<ProductModalProps> = ({ productResponse, isOpen, onOpenChange, onSubmit, onDelete }) => {
    const t = useTranslations('Products.Modal');
    
    const formSchema = z.object({
        product: z.object({
            id: z.string().optional(),
            name: z.string(),
            manufacturer: z.object({
                name: z.string(),
            }),
            description: z.string(),
            basePrice: z.number(),
        }),
        markup: z.number().min(0).max(100),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            product: {
                id: productResponse.product?.id ?? '',
                name: productResponse.product?.name ?? '',
                manufacturer: {
                    name: productResponse.product?.manufacturer?.name ?? '',
                },
                description: productResponse.product?.description ?? '',
                basePrice: productResponse.product?.basePrice ?? 0,
            },
            markup: productResponse.markup ?? 0,
        },
    });

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values as ProductResponse);
    }

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        <div className="flex flex-col">
                            <span>{productResponse.product?.name}</span>
                            <span className="text-sm font-light">{t('title')}</span>
                        </div>
                    </ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        {t('description')}
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitValue)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="product.id"
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
                        <FormField
                            control={form.control}
                            name="product.name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.name')}</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="product.manufacturer.name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.manufacturer')}</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="product.basePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.basePrice')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled 
                                            type="number" 
                                            placeholder="" 
                                            {...field} 
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="markup"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.markup')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder={t('placeholders.markup')} 
                                            {...field} 
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex">
                            {productResponse.product?.id && onDelete ? (
                                <Button variant="destructive" onClick={(e) => {
                                    e.preventDefault();
                                    onDelete(productResponse.product?.id ?? '');
                                }}>
                                    {t('buttons.delete')}
                                </Button>
                            ) : ''}
                            <Button type="submit" className="ml-auto">
                                {t('buttons.save')}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default ProductModal;
