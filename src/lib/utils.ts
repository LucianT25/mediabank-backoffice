import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const parseSearchParams = (searchParams: {
    [key: string]: string | string[] | undefined;
}) => {
    return searchParams
        ? Object.keys(searchParams)
            .map((key) => `${key}=${searchParams[key]}`)
            .join("&")
        : "";
};

export const formatDate = (date: string|Date) => {
    let d;
    if (typeof date === 'string') {
        d = DateTime.fromISO(date);
    } else {
        d = DateTime.fromJSDate(date);
    }

    return d.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
}

export const isWithin24Hours = (date: string | Date): boolean => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInHours = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60);
    
    return diffInHours < 24;
}
