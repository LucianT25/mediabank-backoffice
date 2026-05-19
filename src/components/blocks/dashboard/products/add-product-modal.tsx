"use client"

import React, { FC, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AvailableProductsResponse } from '@/interfaces/product.interface';
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalDescription,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultiSelect from '@/components/ui/multi-select';
import { routes, submitData } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import { refreshData } from '@/lib/server-actions';
import { useTableFilters } from '@/hooks/use-table-filters';

export interface AddProductModalProps {
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    availableProducts: AvailableProductsResponse[],
}

const AddProductModal: FC<AddProductModalProps> = ({ isOpen, onOpenChange, availableProducts }) => {
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const { toast } = useToast();
    const { reseller } = useData();
    const { getFilters } = useTableFilters();
    const t = useTranslations('Products.AddModal');
    const tMessages = useTranslations('Messages');

    const formSchema = z.object({
        selectedProducts: z.array(z.string()).min(1, t('selectAtLeastOne')),
        productMarkups: z.array(z.object({
            productId: z.string(),
            productName: z.string(),
            markup: z.number().min(0).max(100),
        })),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedProducts: [],
            productMarkups: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "productMarkups",
    });

    const selectedProducts = form.watch("selectedProducts");

    // Update product markups when selected products change
    useEffect(() => {
        // Get current product markups
        const currentMarkups = form.getValues("productMarkups");
        const currentProductIds = currentMarkups.map(item => item.productId);
        
        // Add new products
        selectedProducts.forEach(productId => {
            if (!currentProductIds.includes(productId)) {
                const product = availableProducts.find(p => p.id === productId);
                if (product) {
                    append({
                        productId: product.id,
                        productName: product.name,
                        markup: 0,
                    });
                }
            }
        });
        
        // Remove products that are no longer selected
        const toRemove: number[] = [];
        currentMarkups.forEach((item, index) => {
            if (!selectedProducts.includes(item.productId)) {
                toRemove.push(index);
            }
        });
        
        // Remove in reverse order to avoid index shifting issues
        toRemove.reverse().forEach(index => remove(index));
    }, [selectedProducts, append, remove, availableProducts, form]);

    async function onSubmitValue(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const productMarkups = values.productMarkups.map(item => ({
                id: item.productId,
                markup: item.markup
            }));

            const response = await submitData(
                `${routes.reseller}/${reseller.id}/add-products`,
                (session as any).accessToken,
                {
                    products: productMarkups
                }
            );

            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                await refreshData(routes.reseller + '/products/' + reseller.key + "?" + getFilters());
                toast({
                    title: tMessages('success'),
                    description: t('addSuccess'),
                });
                
                form.reset({
                    selectedProducts: [],
                    productMarkups: [],
                });
                onOpenChange(false);
            }
            
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent className='overflow-y-visible'>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        <div className="flex flex-col">
                            <span>{t('title')}</span>
                            <span className="text-sm font-light">{t('subtitle')}</span>
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
                            name="selectedProducts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.products')}</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={availableProducts.map(product => ({
                                                label: product.name,
                                                value: product.id
                                            }))}
                                            onChange={(selectedOptions) => {
                                                field.onChange(selectedOptions.map(option => option.value));
                                            }}
                                            placeholder={t('placeholders.selectProducts')}
                                            hidePlaceholderWhenSelected={true}
                                            className="w-full"
                                            loadingIndicator={loading ? t('loading') : undefined}
                                            emptyIndicator={!loading && availableProducts.length === 0 ? 
                                                t('noProducts') : undefined}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {fields.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">{t('productMarkups')}</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-4 p-4 border rounded-md">
                                            <div className="flex-1">
                                                <p className="font-medium">{field.productName}</p>
                                            </div>
                                            <div className="w-32">
                                                <FormField
                                                    control={form.control}
                                                    name={`productMarkups.${index}.markup`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="sr-only">{t('fields.markup')}</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center">
                                                                    <Input 
                                                                        type="number" 
                                                                        placeholder={t('placeholders.markup')} 
                                                                        {...field}
                                                                        min={0}
                                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                                    />
                                                                    <span className="ml-2">%</span>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? t('adding') : t('addToCatalog')}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default AddProductModal;
