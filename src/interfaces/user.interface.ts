export enum AdminType {
    Super = 'super',
    Reseller = 'reseller',
    Manufacturer = 'manufacturer',
}

export interface Address {
    country: string;

    firstName: string;

    lastName: string;

    line1: string;

    line2: string;

    city: string;

    county: string;

    postCode: string;

    phone: string;
}

export interface Settings {
    emailNotifications: boolean;

    emailMarketing: boolean;
}

export interface Admin {
    type: AdminType;

    key: string;
}

export interface User {
    id?: string;
    email: string;
    name?: string;
    resellerKey?: string;
    address?: Address
    settings?: Settings
    admin?: Admin
    deletedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}