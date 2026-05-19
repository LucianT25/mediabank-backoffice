'use client';

import React, { useState, useMemo } from 'react';
import { Material } from '@/interfaces/material.interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle
} from '@/components/ui/responsive-modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaginatedData } from '@/interfaces/paginated-data.interface';
import { Pagination } from '@/components/ui/pagination';

interface MaterialSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materials: PaginatedData<Material>;
  onMaterialsSelected: (selectedMaterials: Material[]) => void;
}

export const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  materials,
  onMaterialsSelected
}) => {
  const t = useTranslations('Products.Customization');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState('1');

  // Calculate pagination
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
  const endIndex = startIndex + parseInt(pageSize);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!globalFilter) return materials.rows;
    const searchValue = globalFilter.toLowerCase();
    return materials.rows.filter(material =>
      material.id?.toLowerCase().includes(searchValue) ||
      material.productAlias?.toLowerCase().includes(searchValue)
    );
  }, [materials.rows, globalFilter]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  const actualPageCount = Math.ceil(filteredData.length / parseInt(pageSize));

  const columns: ColumnDef<Material>[] = useMemo(() => [
    {
      id: 'select',
      header: () => {
        const allCurrentPageIds = paginatedData.map(material => material.id);
        const allSelected = allCurrentPageIds.length > 0 && allCurrentPageIds.every(id => selectedMaterialIds.has(id));
        const someSelected = allCurrentPageIds.some(id => selectedMaterialIds.has(id));
        
        return (
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) (el as HTMLInputElement).indeterminate = someSelected && !allSelected;
            }}
            onCheckedChange={(value) => {
              const newSelection = new Set(selectedMaterialIds);
              if (value) {
                allCurrentPageIds.forEach(id => newSelection.add(id));
              } else {
                allCurrentPageIds.forEach(id => newSelection.delete(id));
              }
              setSelectedMaterialIds(newSelection);
            }}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => {
        const materialId = row.original.id;
        return (
          <Checkbox
            checked={selectedMaterialIds.has(materialId)}
            onCheckedChange={(value) => {
              const newSelection = new Set(selectedMaterialIds);
              if (value) {
                newSelection.add(materialId);
              } else {
                newSelection.delete(materialId);
              }
              setSelectedMaterialIds(newSelection);
            }}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'productAlias',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Alias
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.productAlias || '-'}
        </div>
      ),
    },
  ], [paginatedData, selectedMaterialIds]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAddSelected = () => {
    const selectedMaterials = materials.rows.filter(material => selectedMaterialIds.has(material.id));
    onMaterialsSelected(selectedMaterials);
    setSelectedMaterialIds(new Set());
    setGlobalFilter('');
  };

  const handleCancel = () => {
    setSelectedMaterialIds(new Set());
    setGlobalFilter('');
    setPage('1');
    onOpenChange(false);
  };

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    setPage('1');
  };

  const selectedCount = selectedMaterialIds.size;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-w-4xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{t('materialSelection.title')}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{t('materialSelection.description')}</ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4">
          <Input
            placeholder={t('materialSelection.searchPlaceholder')}
            value={globalFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="border rounded-md">
            <div className="relative overflow-auto max-h-[410px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={selectedMaterialIds.has(row.original.id) && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {globalFilter ? t('materialSelection.noSearchResults') : t('materialSelection.noMaterials')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            pageSize={pageSize}
            setPageSize={setPageSize}
            page={page}
            setPage={setPage}
            pageCount={actualPageCount}
          />
        </div>

        <ResponsiveModalFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('materialSelection.cancel')}
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedCount === 0}
          >
            {t('materialSelection.addSelected', { selectedCount })}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default MaterialSelectionModal;
