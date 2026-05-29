"use client"

import {Product} from "@/interfaces/product.interface";
import * as React from "react";
import {useTableFilters} from "@/hooks/use-table-filters";
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, MoreHorizontal, X} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Pagination} from "@/components/ui/pagination";
import Link from "next/link";
import { PaginatedData } from "@/interfaces/paginated-data.interface";
import { useTranslations } from "next-intl";

export const ProductsTable = ({rows, total}: PaginatedData<Product>) => {
    const t = useTranslations('Products.Table');
    const [rowSelection, setRowSelection] = React.useState({});

    const {
        getFiltersObj,
        setFilters,
        clearFilters,
        setSort,
    } = useTableFilters();

    const limit = +(getFiltersObj()["limit"] ?? 10)
    const pageCount = Math.ceil(total / limit);

    const columns: ColumnDef<Product>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("name")}>
                        {t('product')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize flex items-center">
                    {row.original.name ?? '-'}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("type")}>
                        {t('type')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>{row.original.type}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(product.id ?? "")}
                            >
                                {t('copyProductId')}
                            </DropdownMenuItem>
                            <Link href={`products/${product.id}/pricing`}>
                                <DropdownMenuItem
                                    onClick={() => {}}
                                >
                                    {t('editPricingFormula')}
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`products/${product.id}/customization`}>
                                <DropdownMenuItem>
                                    {t('editCustomizations')}
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`products/${product.id}/iflows`}>
                                <DropdownMenuItem>
                                    {t('editIflowsMapping')}
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: rows ?? [],
        columns,
        pageCount,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualFiltering: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center py-4 justify-between">
                <div className="flex gap-4">
                    <Input
                        placeholder="Search"
                        key={getFiltersObj()["search"] ?? "reset-key"}
                        defaultValue={getFiltersObj()["search"] ?? ""}
                        onChange={(event) => {
                            setFilters([{ key: "search", value: event.target.value }]);
                        }}
                        className="w-64"
                        debounced={true}
                    />
                    {Object.keys(getFiltersObj()).some(key =>
                        key !== "page" && key !== "limit" && getFiltersObj()[key]
                    ) && (
                        <Button
                            variant="outline"
                            onClick={() => clearFilters()}
                        >
                            <X/>
                            {t('clearFilters')}
                        </Button>
                    )}
                </div>
                <div className="flex justify-between gap-4">
                    <Button
                        onClick={() => {
                        }}
                        disabled={true}
                    >
                        {t('addProduct')}
                    </Button>
                </div>
            </div>
            <div className="relative max-h-[65vh] overflow-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 bg-secondary">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns?.length}
                                    className="h-24 text-center"
                                >
                                    {t('noResults')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination
                page={getFiltersObj()["page"] ?? 1}
                setPage={(value) =>
                    setFilters([
                        { key: "page", value },
                        { key: "limit", value: getFiltersObj()["limit"] ?? "10" },
                    ])
                }
                pageSize={getFiltersObj()["limit"] ?? "10"}
                setPageSize={(value) =>
                    setFilters([
                        { key: "page", value: "1" },
                        { key: "limit", value: value },
                    ])
                }
                pageCount={pageCount}
            />
        </div>
    );
}