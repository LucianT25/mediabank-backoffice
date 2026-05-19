import {Order, OrderItem} from "@/interfaces/order.interface";
import {Manufacturer} from "@/interfaces/manufacturer.interface";

export enum OrderFulfillmentItemStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    SHIPPED = 'shipped',
    DONE = 'done',
    CANCELLED = 'cancelled',
}

export interface OrderFulfillment {
    id: string;
    manufacturer: Manufacturer;
    order: Order;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}