"use client"

import {Material} from "@/interfaces/material.interface";
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
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Pagination} from "@/components/ui/pagination";
import Link from "next/link";
import {PaginatedData} from "@/interfaces/paginated-data.interface";
import {useTranslations} from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { submitData, routes } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import { refreshData } from "@/lib/server-actions";

export const MaterialsTable = ({rows, total}: PaginatedData<Material>) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const t = useTranslations("");
    const tMessages = useTranslations("Messages");

    const [rowSelection, setRowSelection] = React.useState({});

    const {
        getFiltersObj,
        setFilters,
        clearFilters,
        setSort,
        getFilters
    } = useTableFilters();

    const limit = +(getFiltersObj()["limit"] ?? 10)
    const pageCount = Math.ceil(total / limit);

    const deleteMaterials = async (ids: string) => {
        const idArray = ids.split(',');
        const isMultiple = idArray.length > 1;
        const confirmMessage = isMultiple 
            ? t('Materials.Table.confirmDeleteMultiple', { count: idArray.length }) 
            : t('Materials.Table.confirmDeleteSingle');
            
        if (!confirm(confirmMessage)) return;
        try {
            const response = await submitData(
                `${routes.material}/${ids}`,
                (session as any).accessToken,
                null,
            );
            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                await refreshData(routes.material + '/manufacturer/' + (session as any)?.user?.organisation + '?' + getFilters());
                toast({
                    title: tMessages('success'),
                    description: isMultiple 
                        ? t('Materials.Table.materialsDeleted')
                        : t('Materials.Table.materialsDeleted'),
                });

                 if (Object.keys(rowSelection).length) {
                    setRowSelection({});
                }
            }
        } catch (e: any) {
            console.log(e);
            console.log(e.message);
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        }
    }
    
    const columns: ColumnDef<Material>[] = [
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
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("id")}>
                        ID
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>{row.original.id}</div>
            ),
        },
        {
            accessorKey: "productAlias",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("productAlias")}>
                        Alias
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize flex items-center">
                    {row.original.productAlias ?? '-'}
                </div>
            ),
        },
        {
            accessorKey: "aspect",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("aspect")}>
                        Aspect
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize flex items-center">
                    {row.original.aspect ?? '-'}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const material = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(material.id ?? "")}
                            >
                                {t("Materials.Table.copyMaterialId")}
                            </DropdownMenuItem>
                            <Link href={`materials/${material.id}`}>
                                <DropdownMenuItem
                                    onClick={() => {}}
                                >
                                    {t("Materials.Table.editMaterial")}
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteMaterials(material.id ?? "")}
                            >
                                {t("Materials.Table.deleteMaterial")}
                            </DropdownMenuItem>
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
                            {t('Materials.Table.clearFilters')}
                        </Button>
                    )}
                </div>
                <div className="flex justify-between gap-4">
                    <Button
                        variant={'destructive'}
                        disabled={Object.keys(rowSelection).length === 0}
                        onClick={() => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            const selectedIds = selectedRows
                                .map(row => row.original.id)
                                .filter(Boolean)
                                .join(',');
                                
                            deleteMaterials(selectedIds);
                        }}
                    >
                        {t('Materials.Table.deleteSelectedItems')}
                    </Button>
                    <Link href="/dashboard/materials/new">
                        <Button>
                            {t('Materials.Table.addMaterial')}
                        </Button>
                    </Link>
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
                                    No results.
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