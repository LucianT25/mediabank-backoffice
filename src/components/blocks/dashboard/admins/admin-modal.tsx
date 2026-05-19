"use client"

import React, {FC} from 'react';
import {AdminType, User} from '@/interfaces/user.interface';
import {
    ResponsiveModal,
    ResponsiveModalContent, ResponsiveModalDescription,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormProvider, useForm} from 'react-hook-form';
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Reseller} from "@/interfaces/reseller.interface";
import {Manufacturer} from "@/interfaces/manufacturer.interface";
import { useTranslations } from "next-intl";

export interface UserModalProps {
    user: Partial<User>,
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (user: User) => void,
    onDelete: (id: string) => void,
    resellers: Reseller[],
    manufacturers: Manufacturer[],
}


const AdminModal: FC<UserModalProps> = ({user, isOpen, onOpenChange, onSubmit, onDelete, resellers, manufacturers}) => {
    const t = useTranslations('Admins.Modal');
    
    const formSchema = z.object({
        id: z.string().optional(),
        name: z.string(),
        email: z.string(),
        admin: z.object({
            type: z.nativeEnum(AdminType),
            key: z.string(),
        }),

    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            id: user.id ?? '',
            name: user.name ?? '',
            email: user.email ?? '',
            admin: {
                type: user.admin?.type ?? AdminType.Super,
                key: user.admin?.key ?? ''
            }
        },
    })

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values)
    }

    const selectedType = form.watch('admin.type');

    return (<ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
        <ResponsiveModalContent>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle>
                    {user.id ? '' : t('sendInvitationTo')}
                    <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-sm font-light">{user.email}</span>
                    </div>
                </ResponsiveModalTitle>
                {user.id ? '' :<ResponsiveModalDescription>
                    {t('invitationDescription')}
                </ResponsiveModalDescription>}
            </ResponsiveModalHeader>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmitValue)} className="space-y-8">
                    {user.id ? <FormField
                        control={form.control}
                        name="id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('id')}</FormLabel>
                                <FormControl>
                                    <Input disabled placeholder="" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> : ''}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('name')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('email')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="admin.type"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('type')}</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value + ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('pleaseSelect')}/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[AdminType.Super, AdminType.Reseller, AdminType.Manufacturer].map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    {selectedType === AdminType.Reseller && <FormField
                        control={form.control}
                        name="admin.key"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('resellerKey')}</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value + ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('pleaseSelect')}/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {resellers.map((reseller) => (
                                                <SelectItem key={reseller.id} value={reseller.key}>
                                                    {reseller.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />}

                    {selectedType === AdminType.Manufacturer && <FormField
                        control={form.control}
                        name="admin.key"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('manufacturerKey')}</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value + ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('pleaseSelect')}/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {manufacturers.map((manufacturer) => (
                                                <SelectItem key={manufacturer.id} value={manufacturer.key}>
                                                    {manufacturer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />}

                    <div className="flex">
                        {user.id ? <Button variant="destructive" onClick={(e) => {
                            e.preventDefault();
                            onDelete(user.id ?? '')
                        }}>{t('delete')}</Button> : ''}
                        <Button type="submit" className="ml-auto">{t('submit')}</Button>
                    </div>

                </form>
            </FormProvider>


        </ResponsiveModalContent>
    </ResponsiveModal>)
}

export default AdminModal
