"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, TriangleAlert, X } from "lucide-react";
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
import { AvailableProductsResponse, ProductResponse } from "@/interfaces/product.interface";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useTableFilters } from "@/hooks/use-table-filters";
import ProductModal from "./product-modal";
import { useData } from "@/context/data-context";
import AddProductModal from "./add-product-modal";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export interface ProductsTableProps {
    data: ProductResponse[];
    availableProducts: AvailableProductsResponse[]
}

export const ProductCatalogTable: FC<ProductsTableProps> = ({ data, availableProducts }) => {
    const [rowSelection, setRowSelection] = React.useState({});
    const [editedProduct, setEditedProduct] = useState<Partial<ProductResponse>>({});
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [productAddModalOpen, setAddProductModalOpen] = useState(false);
    const { data: session } = useSession();
    const { reseller } = useData();
    const { toast } = useToast();
    const t = useTranslations('Products.Table');
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

    const viewProduct = (product: ProductResponse) => {
        // open product details page
    };

    const editProduct = (product: ProductResponse) => {
        setEditedProduct(product);
        setProductModalOpen(true);
    };

    const submitProduct = async (product: ProductResponse) => {
        try {
            const response = await submitData(
                `${routes.reseller}/${reseller.id}/catalog`,
                (session as any).accessToken,
                {
                    id: product.product.id,
                    markup: product.markup
                },
            );

            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('genericError'),
                    description: response.error.message,
                });
            } else {
                await refreshData(routes.reseller + '/products/' + reseller.key + "?" + getFilters());
                toast({
                    title: tMessages('success'),
                    description: t('productUpdated'),
                });
                setProductModalOpen(false);
            }

        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('genericError'),
                description: e.message,
            });
        }
    };

    const deleteProducts = async (ids: string) => {
        const idArray = ids.split(',');
        const isMultiple = idArray.length > 1;
        const confirmMessage = isMultiple 
        ? t('confirmDeleteMultiple', { count: idArray.length })
        : t('confirmDeleteSingle');

        if (!confirm(confirmMessage)) return;

        try {
            const response = await submitData(
                `${routes.reseller}/${reseller.id}/catalog/${ids}`,
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
                await refreshData(routes.reseller + '/products/' + reseller.key + "?" + getFilters());
                toast({
                    title: "Success!",
                    description: isMultiple 
                    ? t('productsDeleted')
                    : t('productDeleted'),
                });

                if (productModalOpen) {
                    setProductModalOpen(false);
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

    const columns: ColumnDef<ProductResponse>[] = [
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
            accessorKey: "product.name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("product.name")}>
                        {t('product')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize flex items-center">
                {row.original.product.name ?? '-'}
                {!row.original.product.manufacturer.active && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <TriangleAlert className="ml-2 size-4 text-orange-500"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('manufacturerDisabled')}</p>
                                <p>{t('productNotVisible')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            ),
        },
        {
            accessorKey: "product.manufacturer.name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("product.manufacturer.name")}>
                        {t('manufacturer')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize">{row.original.product.manufacturer.name ?? '-'}</div>
            ),
        },
        {
            accessorKey: "markup",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => setSort("markup")}>
                        {t('markup')}
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>{row.original.markup}%</div>
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
                                onClick={() => navigator.clipboard.writeText(product.product.id ?? "")}
                            >
                                {t('copyProductId')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewProduct(product)}>
                                {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editProduct(product)}>
                                {t('editProduct')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteProducts(product.product.id ?? "")}
                            >
                                {t('deleteProduct')}
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
            <ProductModal
                productResponse={editedProduct}
                isOpen={productModalOpen}
                onOpenChange={setProductModalOpen}
                onSubmit={submitProduct}
                onDelete={deleteProducts}
            />
            <AddProductModal
                isOpen={productAddModalOpen}
                onOpenChange={setAddProductModalOpen}
                availableProducts={availableProducts}
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
                        variant={'destructive'}
                        disabled={Object.keys(rowSelection).length === 0}
                        onClick={() => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            const selectedIds = selectedRows
                                .map(row => row.original.product.id)
                                .filter(Boolean)
                                .join(',');
                                
                            deleteProducts(selectedIds);
                        }}
                    >
                        {t('deleteSelected')}
                    </Button>
                    <Button 
                        onClick={() => {
                            setAddProductModalOpen(true);
                        }}
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
};
