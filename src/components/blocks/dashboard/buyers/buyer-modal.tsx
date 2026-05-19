"use client"

import React, {FC} from 'react';
import {useTranslations} from 'next-intl';
import {User} from '@/interfaces/user.interface';
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalHeader, 
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";

export interface UserModalProps {
    user: Partial<User>,
    isOpen: boolean,
    onOpenChange: (state: boolean) => void,
}

const BuyerModal: FC<UserModalProps> = ({user, isOpen, onOpenChange }) => {
    const t = useTranslations('Buyers.Modal');
    const address = user.address;

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-sm font-light">{user.email}</span>
                        </div>
                    </ResponsiveModalTitle>
                </ResponsiveModalHeader>
                {address ? (
                    <div className="grid gap-2 mt-4">
                        <p>
                            <strong>{t('fullName')}:</strong> {address.firstName} {address.lastName}
                        </p>
                        <p>
                            <strong>{t('addressLine1')}:</strong> {address.line1}
                        </p>
                        {address.line2 && (
                            <p>
                                <strong>{t('addressLine2')}:</strong> {address.line2}
                            </p>
                        )}
                        <p>
                            <strong>{t('city')}:</strong> {address.city}
                        </p>
                        <p>
                            <strong>{t('county')}:</strong> {address.county}
                        </p>
                        <p>
                            <strong>{t('postCode')}:</strong> {address.postCode}
                        </p>
                        <p>
                            <strong>{t('country')}:</strong> {address.country}
                        </p>
                        <p>
                            <strong>{t('phone')}:</strong> {address.phone}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {t('noAddressInfo')}
                    </p>
                )}
            </ResponsiveModalContent>
        </ResponsiveModal>
    )
}

export default BuyerModal
