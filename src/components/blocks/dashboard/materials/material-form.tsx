'use client'

import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useRouter} from 'next/navigation'
import {useTransition} from 'react'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage, FormDescription,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {useTranslations} from "next-intl";
import ColorPicker from "@/components/ui/color-picker";
import {Popover, PopoverTrigger, PopoverContent} from '@/components/ui/popover'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {routes, submitData} from "@/lib/fetcher";
import {useSession} from "next-auth/react";
import { useToast } from '@/hooks/use-toast'

// Zod schema based on full Material interface
const materialSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    colorName: z.string().optional(),
    colorCode: z.string().optional(),
    colorHex: z.string().optional(),
    colorStandard: z.string().optional(),
    colorFinish: z.string().optional(),
    productAlias: z.string().optional(),
    currency: z.string().min(1),
    salesUnit: z.string().min(1),
    purchasePrice: z.coerce.number().min(0),
    addedPrice: z.coerce.number().int().min(0),
    salePrice: z.coerce.number().min(0),
    equipment: z.string().optional(),
    workProfile: z.string().optional(),
    materialSize: z.string().optional(),
    sizeUnit: z.string().optional(),
    weightKg: z.coerce.number().optional(),
    weightUnit: z.string().optional(),
    optimizationOptions: z.string().optional(),
    optimizationType: z.string().optional(),
    ledDensity: z.string().nullable().optional(),
    consumption: z.coerce.number().optional(),
    aspect: z.string().optional(),
})

type MaterialFormData = z.infer<typeof materialSchema>

export default function MaterialForm({
                                         initialData,
                                     }: {
    initialData?: Partial<MaterialFormData> | null
}) {
    const t = useTranslations();
    const {data: session} = useSession();
    const {toast} = useToast();

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<MaterialFormData>({
        resolver: zodResolver(materialSchema),
        defaultValues: initialData ?? {
            name: '',
            colorName: '',
            colorCode: '',
            colorHex: '',
            colorStandard: '',
            colorFinish: '',
            productAlias: '',
            currency: '',
            salesUnit: '',
            purchasePrice: 0,
            addedPrice: 0,
            salePrice: 0,
            equipment: '',
            workProfile: '',
            materialSize: '',
            sizeUnit: '',
            weightKg: 0,
            weightUnit: '',
            optimizationOptions: '',
            optimizationType: '',
            ledDensity: '',
            consumption: 0,
            aspect: 'matte', // or '', depending on your design
        },
    })

    const onSubmit = async (data: MaterialFormData) => {
        const method = initialData?.id ? 'PATCH' : 'POST';

        try {
            const response = await submitData(
                routes.material + (method === 'PATCH' ? `/${initialData?.id}` : ''),
                (session as any).accessToken,
                {
                    manufacturerKey: (session as any)?.user?.organisation,
                    ...data
                },
                method,
            );

            if (response.error) {
                toast({
                    variant: "destructive",
                    title: t('Messages.genericError'),
                    description: response.error.message,
                });
            } else {
                toast({
                    title: t('Messages.success'),
                    description: initialData?.id ? t('Materials.Table.materialUpdated') : t('Materials.Table.materialCreated'),
                });

                startTransition(() => router.push('/dashboard/materials'))
            }

        } catch (err: any) {
            toast({
                variant: "destructive",
                title: t('Messages.genericError'),
                description: err.message,
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Hidden ID */}
                <FormField
                    control={form.control}
                    name="id"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field} value={field.value ?? undefined} type="hidden"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {/* Naming Section */}
                <div className="grid gap-4">
                    <h3 className="leading-none font-semibold">{t('Materials.Form.naming')}</h3>
                    <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['name', 'productAlias'].map((field) => (
                            <FormField
                                key={field}
                                control={form.control}
                                name={field as keyof MaterialFormData}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? undefined}
                                                   type={typeof field.value === 'number' ? 'number' : 'text'}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Color Section */}
                <div className="grid gap-4">
                    <h3 className="leading-none font-semibold">{t('Materials.Form.color')}</h3>
                    <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['colorName', 'colorCode', 'colorStandard', 'colorFinish'].map((field) => (
                            <FormField
                                key={field}
                                control={form.control}
                                name={field as keyof MaterialFormData}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? undefined}
                                                   type={typeof field.value === 'number' ? 'number' : 'text'}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}

                        <FormField
                            control={form.control}
                            name="aspect"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t(`Materials.Fields.aspect`)}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value ?? 'matte'}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('Misc.select')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="matte">{t(`Materials.Fields.aspectMatte`)}</SelectItem>
                                            <SelectItem value="glossy">{t(`Materials.Fields.aspectGlossy`)}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {t('Materials.Fields.aspectDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            key={'colorHex'}
                            control={form.control}
                            name={'colorHex'}
                            render={({field}) => (
                                <FormItem className="flex flex-col gap-[10px]">
                                    <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline">{field.value}</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="rounded-2xl shadow-none border-0 p-0">
                                                <ColorPicker defaultValue={field.value}
                                                             onChange={(value) => field.onChange(value)}/>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Size & Units */}
                <div className="grid gap-4">
                    <h3 className="leading-none font-semibold">{t('Materials.Form.sizeUnits')}</h3>
                    <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['materialSize', 'weightKg', 'sizeUnit', 'weightUnit'].map((field) => (
                            <FormField
                                key={field}
                                control={form.control}
                                name={field as keyof MaterialFormData}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? undefined}
                                                   type={typeof field.value === 'number' ? 'number' : 'text'}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div className="grid gap-4">
                    <h3 className="leading-none font-semibold">{t('Materials.Form.pricing')}</h3>
                    <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['currency', 'salesUnit', 'purchasePrice', 'addedPrice', 'salePrice'].map((field) => (
                            <FormField
                                key={field}
                                control={form.control}
                                name={field as keyof MaterialFormData}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? undefined}
                                                   type={typeof field.value === 'number' ? 'number' : 'text'}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Optimization & Others */}
                <div className="grid gap-4">
                    <h3 className="leading-none font-semibold">{t('Materials.Form.optimizationOthers')}</h3>
                    <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['optimizationOptions', 'optimizationType', 'ledDensity', 'consumption', 'equipment', 'workProfile'].map((field) => (
                            <FormField
                                key={field}
                                control={form.control}
                                name={field as keyof MaterialFormData}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t(`Materials.Fields.${field.name}`)}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? undefined}
                                                   type={typeof field.value === 'number' ? 'number' : 'text'}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button className="w-32" type="submit" disabled={form.formState.isSubmitting || isPending}>
                        {t('Misc.save')}
                    </Button>
                </div>
            </form>
        </Form>
    )

}
