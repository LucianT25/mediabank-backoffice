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
import BuyerModal from "@/components/blocks/dashboard/buyers/buyer-modal";
import { routes, submitData } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import { refreshData } from "@/lib/server-actions";
import { User } from "@/interfaces/user.interface";
import { PaginatedData } from "@/interfaces/paginated-data.interface";
import { Pagination } from "@/components/ui/pagination";
import {useToast} from "@/hooks/use-toast";
import {useTableFilters} from "@/hooks/use-table-filters";
import { useTranslations } from "next-intl";

export interface UsersTableProps {
    data: PaginatedData<User>;
}

export const BuyersTable: FC<UsersTableProps> = ({ data }) => {
    const [rowSelection, setRowSelection] = React.useState({});
    const [editedUser, setEditedUser] = useState<Partial<User>>({});
    const [userModalOpen, setUserModalOpen] = useState(false);
    const { data: session } = useSession();
    const { toast } = useToast();
    const t = useTranslations('Buyers.Table');
    const tMessages = useTranslations('Messages');

    const {
        getFilters,
        getFiltersObj,
        setFilters,
        getPageCount,
        clearFilters,
        date,
        setDate,
        setSort,
    } = useTableFilters();

    const pageCount = getPageCount(data?.total);

    const viewUser = (user: any) => {
        setEditedUser(user);
        setUserModalOpen(true);
    };

    const resetPasswordForBuyer = async (data: User) => {
        if (!confirm(t('confirmResetPassword'))) return;

        try {
            const response = await submitData(
                routes.auth + '/forgot-password?source=client',
                (session as any).accessToken,
                {
                    email: data.email,
                    resellerKey: data.resellerKey
                }
            );

            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                toast({
                    title: tMessages('success'),
                    description: t('emailSent'),
                });
            }

        } catch (err: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: err.message,
            });
        }
    }

    const deleteUser = async (id: string) => {
        if (!confirm(t('confirmDeleteUser'))) return;
        
        try {
            await submitData(
                `${routes.user}/${id}`,
                (session as any).accessToken,
                null,
            );
            setUserModalOpen(false);
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        } finally {
            await refreshData(routes.user);
            toast({
                title: tMessages('success'),
                description: t('userDeleted'),
            });
        }
    };

    const columns: ColumnDef<User>[] = [
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
                <div className="capitalize">{row.getValue("name") ?? '-'}</div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("email")}>
                        {t('email')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "resellerKey",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("resellerKey")}>
                        {t('resellerKey')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("resellerKey")}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;

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
                                onClick={() => navigator.clipboard.writeText(user.id ?? "")}
                            >
                                {t('copyUserId')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewUser(user)}>
                                {t('viewInfo')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => resetPasswordForBuyer(user)}>
                                {t('resetPassword')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteUser(user.id ?? "")}
                            >
                                {t('deleteUser')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: data?.rows ?? [],
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
            <BuyerModal
                user={editedUser}
                isOpen={userModalOpen}
                onOpenChange={setUserModalOpen}
            />
            <div className="flex items-center py-4 gap-4">
                <Input
                    placeholder={t('filterPlaceholder')}
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
