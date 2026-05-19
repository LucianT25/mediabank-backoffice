"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {FC, useMemo} from "react";
import {PaginatedData} from "@/interfaces/paginated-data.interface";
import {Pagination} from "@/components/ui/pagination";
import {useTableFilters} from "@/hooks/use-table-filters";
import {OrderItem} from "@/interfaces/order.interface";
import {OrderFulfillment} from "@/interfaces/order-fulfillment.interface";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslations } from "next-intl";

export interface OrdersTableProps {
    data: PaginatedData<OrderFulfillment>;
}

export const OrderFulfillmentsTable: FC<OrdersTableProps> = ({data}) => {
    const {
        getFiltersObj,
        setFilters,
        getPageCount,
        setSort,
    } = useTableFilters();
    const t = useTranslations('Fulfillments.Table');

    const pageCount = getPageCount(data?.total);

    const ofWithStatus = useMemo(() => {
        if (!data?.rows || data.rows.length === 0) {
            return [];
        }
        
        return data.rows.map(of => {
            let status = 'pending';
            if (of.items.some(i => i.status !== 'pending')) status = 'in-progress';
            if (of.items.every(i => i.status === 'done')) status = 'done';

            return ({
                ...of,
                status
            });
        });
    }, [data?.rows]);

    const columns: ColumnDef<OrderFulfillment>[] = [
        {
            id: "orderId",
            accessorFn: (row) => row.order.id,
            header: () => (
                <Button variant="ghost" onClick={() => setSort("order.id")}>
                    {t('orderId')} <ArrowUpDown className="ml-2 size-4"/>
                </Button>
            ),
            cell: ({getValue}) => <div>{getValue<string>()}</div>,
        },
        {
            id: "clientName",
            accessorFn: (row) =>
                `${row.order.shippingAddress.firstName} ${row.order.shippingAddress.lastName}`,
            header: () => (
                <Button variant="ghost" onClick={() => setSort("order.shippingAddress.firstName")}>
                    {t('client')} <ArrowUpDown className="ml-2 size-4"/>
                </Button>
            ),
            cell: ({getValue}) => <div>{getValue<string>()}</div>,
        },
        {
            accessorKey: "items",
            header: () => (
                <Button variant="ghost" onClick={() => {
                }}>{t('items')}</Button>
            ),
            cell: ({row}) => <div
                className="">{t('itemsCount', { count: (row.getValue("items") as OrderItem[]).length })}</div>,
        },
        {
            accessorKey: "status",
            header: () => (
                <Button variant="ghost" onClick={() => setSort("status")}>{t('status')} <ArrowUpDown
                    className="ml-2 size-4"/></Button>
            ),
            cell: ({row}) => <StatusBadge status={row.getValue("status")}/>,
        },
        {
            accessorKey: "createdAt",
            header: () => (
                <Button variant="ghost" onClick={() => setSort("createdAt")}>{t('createdAt')} <ArrowUpDown
                    className="ml-2 size-4"/></Button>
            ),
            cell: ({row}) => <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
        },
        {
            id: "actions",
            cell: ({row}) => {
                const of = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Link href={`/dashboard/order-fulfillments/${of.id}`}>{t('view')}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(of.id ?? "")}>{t('copyId')}</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: ofWithStatus,
        columns,
        pageCount,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <div className="w-full">
            <div className="relative max-h-[65vh] overflow-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 bg-secondary">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">{t('noResults')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination
                page={getFiltersObj()["page"] ?? 1}
                setPage={(value) => setFilters([{key: "page", value}, {
                    key: "limit",
                    value: getFiltersObj()["limit"] ?? "10"
                }])}
                pageSize={getFiltersObj()["limit"] ?? "10"}
                setPageSize={(value) => setFilters([{key: "page", value: "1"}, {key: "limit", value}])}
                pageCount={pageCount}
            />
        </div>
    );
};
