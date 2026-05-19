import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResponsiveModal, ResponsiveModalContent, ResponsiveModalDescription, ResponsiveModalHeader, ResponsiveModalTitle } from "@/components/ui/responsive-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form";
import { useTranslations } from 'next-intl';
import * as z from "zod";

export interface AddStatusModalProps {
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
    onSubmit: (message: string) => void
}

const AddStatusModal: FC<AddStatusModalProps> = ({ isOpen, onOpenChange, onSubmit }) => {
    const t = useTranslations('Fulfillments.AddStatus');
    
    const formSchema = z.object({
        message: z.string()
            .min(1, t('validation.messageRequired'))
            .max(100, t('validation.messageMaxLength'))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: ''
        }
    })

    useEffect(() => {
        if (isOpen) {
            form.reset({ message: '' });
        }
    }, [isOpen, form]);

    function onSubmitValue(values: z.infer<typeof formSchema>) {
        onSubmit(values.message);
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
                            name="message"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('fields.message')}</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit">{t('buttons.addStatus')}</Button>
                        </div>
                    </form>
                </FormProvider>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

export default AddStatusModal;
