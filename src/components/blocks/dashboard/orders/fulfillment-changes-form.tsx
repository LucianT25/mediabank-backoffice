"use client"

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { OrderFulfillment } from "@/interfaces/order-fulfillment.interface"
import { isWithin24Hours } from "@/lib/utils"
import { PackageIcon } from "lucide-react"
import { FC } from "react"
import { Button } from "@/components/ui/button"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface FulfillmentChangesFormProps {
    fulfillment: OrderFulfillment
    onSubmit: (data: FulfillmentChangesFormValues) => void
}

const formSchema = z.object({
    deliveryDate: z.date(),
    items: z.array(
        z.object({
            id: z.string(),
            price: z.number().min(0, "Price must be a positive number"), // come back to this
            productName: z.string().optional(),
            productType: z.string().optional()
        })
    )
})

type FulfillmentChangesFormValues = z.infer<typeof formSchema>

export const FulfillmentChangesForm: FC<FulfillmentChangesFormProps> = ({ fulfillment, onSubmit }) => {
    const t = useTranslations('Fulfillments.ChangesForm');

    const form = useForm<FulfillmentChangesFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deliveryDate: fulfillment.order.deliveryDate ? new Date(fulfillment.order.deliveryDate) : new Date(),
            items: fulfillment.items.map(item => ({
                id: item.id,
                price: Number(item.price),
                productName: item.product?.name,
                productType: item.product?.type
            }))
        }
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "items"
    })

    const handleSubmit = (values: FulfillmentChangesFormValues) => {
        onSubmit(values)
    }

    return (
        <>
            {isWithin24Hours(fulfillment.createdAt) &&
                <Card className="border-2 border-yellow-200">
                    <CardHeader className="bg-yellow-50">
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="h-5 w-5" />
                            {t('title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="deliveryDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{t('fields.proposedDeliveryDate')}</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder={t('placeholders.selectDeliveryDate')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <FormLabel>{t('fields.productPriceAdjustments')}</FormLabel>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-col sm:flex-row gap-2 sm:items-center p-3 border rounded-md">
                                            <div className="flex-grow">
                                                <p className="font-medium">{field.productName}</p>
                                                <p className="text-sm text-muted-foreground">{field.productType}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.price`}
                                                render={({ field: quoteField }) => (
                                                    <FormItem className="min-w-[150px] mb-0">
                                                        <FormLabel className="text-xs">
                                                            {t('labels.current')}: ${Number(fulfillment.items[index].price)?.toFixed(2) ?? '0.00'}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-center">
                                                                <span className="mr-1 text-sm">$</span>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="flex-1"
                                                                    {...quoteField}
                                                                    onChange={(e) => quoteField.onChange(parseFloat(e.target.value))}
                                                                    value={quoteField.value}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="submit"
                                        variant="default"
                                    >
                                        {t('buttons.submitChanges')}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            }
        </>
    );
}
