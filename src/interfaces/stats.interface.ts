import { OrderStatus } from "./order.interface";

export interface StatsResponse {
    newItems: StatsItem[];
    totalItems: number;
    totalRevenue: number;
    itemGrowth: Growth;
    revenueGrowth: Growth;
}

export interface StatsItem {
    id: string;
    number: number;
    email: string;
    status: OrderStatus;
    createdAt: string;
    total: string;
}

export interface Growth {
    percentIncrease: number;
    current: number;
    previous: number;
}
