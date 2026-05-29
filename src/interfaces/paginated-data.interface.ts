export interface PaginatedData<T> {
    rows: T[];
    total: number;
}

export function emptyPaginated<T>(): PaginatedData<T> {
    return { rows: [], total: 0 };
}
