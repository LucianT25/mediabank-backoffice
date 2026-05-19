"use client";
import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FC, useState } from "react";
import { routes, submitData } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import { refreshData } from "@/lib/server-actions";
import { Manufacturer } from "@/interfaces/manufacturer.interface";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useTableFilters } from "@/hooks/use-table-filters";
import { Badge } from "@/components/ui/badge";
import ManufacturerModal from "./manufacturer-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export interface ManufacturersTableProps {
    data: Manufacturer[];
}
export const ManufacturersTable: FC<ManufacturersTableProps> = ({ data }) => {
    const [rowSelection, setRowSelection] = useState({});
    const [editedManufacturer, setEditedManufacturer] = useState<Partial<Manufacturer>>({});
    const [manufacturerModalOpen, setManufacturerModalOpen] = useState(false);
    const { data: session } = useSession();
    const { toast } = useToast();
    const t = useTranslations('Manufacturers.Table');
    const tMessages = useTranslations('Messages');
    
    const {
        getFilters,
        getFiltersObj,
        setFilters,
        clearFilters,
        getPageCount,
        setSort,
    } = useTableFilters();
    const pageCount = 1;
    const viewManufacturer = (manufacturer: Manufacturer) => {
        // open manufacturer details page
    };
    const editManufacturer = (manufacturer: Manufacturer) => {
        setEditedManufacturer(manufacturer);
        setManufacturerModalOpen(true);
    };
    const submitManufacturer = async (manufacturer: Manufacturer) => {
        try {
            const response = await submitData(
                `${routes.manufacturer}/${manufacturer.id}`,
                (session as any).accessToken,
                {
                    contactInfo: manufacturer.website?? '',
                    ...manufacturer
                },
            );
            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                await refreshData(routes.manufacturer + "?min=false&" + getFilters());
                toast({
                    title: tMessages('success'),
                    description: manufacturer.id ? t('manufacturerUpdated') : t('manufacturerCreated'),
                });
                setManufacturerModalOpen(false);
            }
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        }
    }
    const deleteManufacturers = async (ids: string) => {
        const idArray = ids.split(',');
        const isMultiple = idArray.length > 1;
        const confirmMessage = isMultiple 
            ? t('confirmDeleteMultiple', { count: idArray.length }) 
            : t('confirmDeleteSingle');
            
        if (!confirm(confirmMessage)) return;
        try {
            const response = await submitData(
                `${routes.manufacturer}/${ids}`,
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
                await refreshData(routes.manufacturer + "?min=false&" + getFilters());
                toast({
                    title: tMessages('success'),
                    description: isMultiple 
                        ? t('manufacturersDeleted')
                        : t('manufacturerDeleted'),
                });

                if (manufacturerModalOpen) {
                    setManufacturerModalOpen(false);
                } else if (Object.keys(rowSelection).length) {
                    setRowSelection({});
                }
            }
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        }
    };
    const columns: ColumnDef<Manufacturer>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label={t('selectAll')}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t('selectRow')}
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
                        {t('name')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize">{row.original.name ?? '-'}</div>
            ),
        },
        {
            accessorKey: "key",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("key")}>
                        {t('key')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>{row.original.key ?? '-'}</div>
            ),
        },
        {
            accessorKey: "address",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("address")}>
                        {t('address')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>{row.original.address ?? '-'}</div>
            ),
        },
        {
            accessorKey: "website",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("website")}>
                        {t('website')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div>{row.original.website ?? '-'}</div>
                );
            }
        },
        {
            accessorKey: "active",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("active")}>
                        {t('status')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>
                    {row.original.active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                        <Badge variant="destructive">Disabled</Badge>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const manufacturer = row.original;
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
                                onClick={() => navigator.clipboard.writeText(manufacturer.id ?? "")}
                            >
                                {t('copyManufacturerId')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewManufacturer(manufacturer)}>
                                {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editManufacturer(manufacturer)}>
                                {t('editManufacturer')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteManufacturers(manufacturer.id ?? "")}
                            >
                                {t('deleteManufacturer')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    const table = useReactTable({
        data: data,
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
            <ManufacturerModal
                manufacturer={editedManufacturer}
                isOpen={manufacturerModalOpen}
                onOpenChange={setManufacturerModalOpen}
                onSubmit={submitManufacturer}
                onDelete={deleteManufacturers}
            />
            <div className="flex items-center py-4 justify-between">
                <div className="flex gap-4">
                    <Input
                        placeholder={t('search')}
                        key={getFiltersObj()["search"] ?? "reset-key"}
                        defaultValue={getFiltersObj()["search"] ?? ""}
                        onChange={(event) => {
                            setFilters([{ key: "search", value: event.target.value }]);
                        }}
                        className="w-64"
                        debounced={true}
                    />
                    <Select
                        key={getFiltersObj()["active"] ?? "reset-key-2"}
                        defaultValue={getFiltersObj()["active"] ?? ""}
                        onValueChange={(value) => {
                            setFilters([{ key: "active", value: value }]);
                        }}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                    </Select>
                    
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
                <Button
                    variant={'destructive'}
                    disabled={Object.keys(rowSelection).length === 0}
                    onClick={() => {
                        const selectedRows = table.getFilteredSelectedRowModel().rows;
                        const selectedIds = selectedRows
                            .map(row => row.original.id)
                            .filter(Boolean)
                            .join(',');
                            
                        deleteManufacturers(selectedIds);
                    }}
                >
                    {t('deleteSelectedItems')}
                </Button>
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
};
