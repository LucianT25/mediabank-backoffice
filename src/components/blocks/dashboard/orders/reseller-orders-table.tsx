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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {FC} from "react";
import {routes, submitData} from "@/lib/fetcher";
import {useSession} from "next-auth/react";
import {refreshData} from "@/lib/server-actions";
import {PaginatedData} from "@/interfaces/paginated-data.interface";
import {Pagination} from "@/components/ui/pagination";
import {useToast} from "@/hooks/use-toast";
import {useTableFilters} from "@/hooks/use-table-filters";
import {Order} from "@/interfaces/order.interface";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/currency";


export interface OrdersTableProps {
    orders: PaginatedData<Order>;
}

export const ResellerOrdersTable: FC<OrdersTableProps> = ({orders}) => {
    const {data: session} = useSession();
    const {toast} = useToast();
    const {getFiltersObj, setFilters, getPageCount, setSort} = useTableFilters();
    const t = useTranslations('Orders.Table');
    const tMessages = useTranslations('Messages');

    const pageCount = getPageCount(orders?.total);

    const deleteOrder = async (id: string) => {
        if (!confirm(t('confirmDelete'))) return;
        try {
            await submitData(`${routes.order}/${id}`, (session as any).accessToken, null);
            toast({title: tMessages('success'), description: t('orderDeleted')});
            await refreshData(routes.order);
        } catch (e: any) {
            toast({variant: "destructive", title: tMessages('genericError'), description: e.message});
        }
    };

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "email",
            header: () => <Button variant="ghost" onClick={() => setSort("email")}>{t('email')} <ArrowUpDown/></Button>,
            cell: ({row}) => <div className="lowercase">{row.getValue("email")}</div>
        },
        {
            accessorKey: "total",
            header: () => <Button variant="ghost" onClick={() => setSort("total")}>{t('total')} <ArrowUpDown/></Button>,
            cell: ({ row }) => <div>{formatCurrency(row.getValue("total") as number)}</div>
        },
        {
            accessorKey: "status",
            header: () => <Button variant="ghost" onClick={() => setSort("status")}>{t('status')} <ArrowUpDown/></Button>,
            cell: ({row}) => <StatusBadge status={row.getValue("status")}/>
        },
        {
            accessorKey: "createdAt",
            header: () => <Button variant="ghost" onClick={() => setSort("createdAt")}>{t('createdAt')} <ArrowUpDown/></Button>,
            cell: ({row}) => <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
        },
        {
            id: "actions", cell: ({row}) => {
                const order = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button
                            variant="ghost"><span className="sr-only">Open menu</span><MoreHorizontal/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Link href={`/dashboard/orders/${order.id}`}>{t('view')}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>{t('copyOrderId')}</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive"
                                              onClick={() => deleteOrder(order.id)}>{t('deleteOrder')}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];

    const table = useReactTable({
        data: orders.rows,
        columns,
        pageCount,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualFiltering: true
    });

    return (
        <>
            <div className="w-full">
                <div className="overflow-auto max-h-[65vh] rounded-md border">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary">
                            {table.getHeaderGroups().map(hg => (
                                <TableRow key={hg.id}>{hg.headers.map(header => <TableHead
                                    key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => <TableCell
                                        key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={columns.length} className="text-center py-8">{t('noResults')}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination page={getFiltersObj().page ?? 1} setPage={p => setFilters([{key: "page", value: p}, {
                    key: "limit",
                    value: getFiltersObj().limit ?? "10"
                }])} pageSize={getFiltersObj().limit ?? "10"}
                            setPageSize={size => setFilters([{key: "page", value: "1"}, {key: "limit", value: size}])}
                            pageCount={pageCount}/>
            </div>
        </>
    );
}
