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
import { Reseller } from "@/interfaces/reseller.interface";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useTableFilters } from "@/hooks/use-table-filters";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ResellerModal from "./reseller-modal";
import { Manufacturer } from "@/interfaces/manufacturer.interface";
import { useTranslations } from "next-intl";

export interface ResellersTableProps {
    data: Reseller[];
    manufacturers: Manufacturer[]
}

export const ResellersTable: FC<ResellersTableProps> = ({ data, manufacturers }) => {
    const [rowSelection, setRowSelection] = React.useState({});
    const [editedReseller, setEditedReseller] = useState<Partial<Reseller>>({});
    const [resellerModalOpen, setResellerModalOpen] = useState(false);
    const { data: session } = useSession();
    const { toast } = useToast();
    const t = useTranslations('Resellers.Table');
    const tMessages = useTranslations('Messages');

    const {
        getFilters,
        getFiltersObj,
        setFilters,
        clearFilters,
        getPageCount,
        date,
        setDate,
        setSort,
    } = useTableFilters();

    const pageCount = 1;

    const viewReseller = (reseller: Reseller) => {
        // open reseller details page
    };

    const editReseller = (reseller: Reseller) => {
        setEditedReseller(reseller);
        setResellerModalOpen(true);
    };

    const submitReseller = async (reseller: Reseller) => {
        try {
            const response = await submitData(
                `${routes.reseller}/${reseller.id}`,
                (session as any).accessToken,
                reseller
            );

            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                await refreshData(routes.reseller + "?" + getFilters());
                toast({
                    title: tMessages('success'),
                    description: reseller.id ? t('resellerUpdated') : t('resellerCreated'),
                });
                setResellerModalOpen(false);
            }
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        }
    }

    const deleteReseller = async (id: string) => {
        if (!confirm(t('confirmDelete'))) return;

        try {
            await submitData(
                `${routes.reseller}/${id}`,
                (session as any).accessToken,
                null,
            );
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        } finally {
            await refreshData(routes.reseller);
            toast({
                title: tMessages('success'),
                description: t('resellerDeleted'),
            });
        }
    };

    const columns: ColumnDef<Reseller>[] = [
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
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("id")}>
                        {t('id')}
                    </Button>
                );
            },
            cell: ({ row }) => {
                const id = row.getValue("id") as string;
                return <div>{id.substring(0, 8)}...</div>;
            },
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("name")}>
                        {t('name')}
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "key",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("key")}>
                        {t('key')}
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("key")}</div>
            ),
        },
        {
            id: "orders",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("orders")}>
                        {t('orders')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: () => <div>{5}</div>,
        },
        {
            id: "subscription",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("subscription")}>
                        {t('subscription')}
                    </Button>
                );
            },
            cell: () => <div>Premium</div>,
        },
        {
            id: "status",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("status")}>
                        {t('status')}
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>
                    {row.original.stripeOnboarded ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            Disabled
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: "lastActive",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("lastActive")}>
                        {t('lastActive')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: () => <div>20/12/2025 - 15:00</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const reseller = row.original;

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
                                onClick={() => navigator.clipboard.writeText(reseller.id ?? "")}
                            >
                                {t('copyResellerId')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewReseller(reseller)}>
                                {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editReseller(reseller)}>
                                {t('editReseller')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteReseller(reseller.id ?? "")}
                            >
                                {t('deleteReseller')}
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
            <ResellerModal
                reseller={editedReseller}
                manufacturers={manufacturers}
                isOpen={resellerModalOpen}
                onOpenChange={setResellerModalOpen}
                onSubmit={submitReseller}
                onDelete={deleteReseller}
            />
            <div className="flex items-center py-4 gap-4">
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
                    key={getFiltersObj()["subscription"] ?? "reset-key-2"}
                    defaultValue={getFiltersObj()["subscription"] ?? "all"}
                    onValueChange={(value) => {
                        setFilters([{ key: "subscription", value }]);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('subscription')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subscriptions</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                </Select>
                
                <Select
                    key={getFiltersObj()["status"] ?? "reset-key-3"}
                    defaultValue={getFiltersObj()["status"] ?? ""}
                    onValueChange={(value) => {
                        setFilters([{ key: "status", value: value }]);
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
