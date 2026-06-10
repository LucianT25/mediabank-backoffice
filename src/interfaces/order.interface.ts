import {OrderItemConfiguration} from "@/interfaces/configuration.interface";
import {Address} from "@/interfaces/user.interface";
import {OrderFulfillment, OrderFulfillmentItemStatus} from "@/interfaces/order-fulfillment.interface";
import {Product} from "@/interfaces/product.interface";
import { Reseller } from "./reseller.interface";


export interface OrderItem {
    id: string;

    configuration: OrderItemConfiguration;

    quantity: number;

    customQuoteMessage?: string;

    price: number;

    status: OrderFulfillmentItemStatus;

    product?: Product;
}

export interface StatusHistory {
    status: string;

    date: Date;
}

export enum DocumentType {
    invoice = 'invoice',
    misc = 'misc'
}

export interface Document {
    type: DocumentType;

    key: string;

    name: string;
}

export enum IflowsSyncStatus {
    created = 'created',
    paid = 'paid',
    failed = 'failed',
}

export enum OrderStatus {
    awaitingPayment = 'awaiting-payment',
    paid = 'paid',
    inProgress = 'in-progress',
    shipped = 'shipped',
    done = 'done',
    cancelled = 'cancelled',
    approved = 'approved',
    declined = 'declined',
    manufacturerChanges = 'manufacturer-changes',
    customQuote = 'custom-quote'
}

export interface Order {
    id: string;

    email: string;

    reseller: Reseller;

    shippingAddress: Address;

    billingAddress: Address;

    total: number;

    status: OrderStatus;

    statusHistory: StatusHistory[];

    documents: Document[];

    shippingMethod: string;

    deliveryDate?: Date;

    paymentIntentId: string;

    iflowsOrderId?: string;

    iflowsSyncStatus?: IflowsSyncStatus;

    iflowsLastSyncError?: string;

    fulfillments: OrderFulfillment[];

    createdAt: Date;

    updatedAt: Date;
}
