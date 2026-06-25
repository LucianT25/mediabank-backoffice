'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Plus, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IflowsEquipmentRuleMaterialOption } from '@/interfaces/product.interface';

export function materialShortLabel(m: IflowsEquipmentRuleMaterialOption): string {
  return m.productAlias || m.iflowsProductCode || m.name;
}

interface EquipmentRuleMaterialPickerProps {
  materials: IflowsEquipmentRuleMaterialOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function EquipmentRuleMaterialPicker({
  materials,
  selectedIds,
  onChange,
  disabled = false,
}: EquipmentRuleMaterialPickerProps) {
  const t = useTranslations('Products.EquipmentProfiles');
  const [modalOpen, setModalOpen] = useState(false);
  const [chipSearch, setChipSearch] = useState('');
  const [modalSelectedIds, setModalSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState('1');

  const materialMap = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials],
  );

  const selectedMaterials = useMemo(
    () =>
      selectedIds
        .map((id) => materialMap.get(id))
        .filter((m): m is IflowsEquipmentRuleMaterialOption => Boolean(m)),
    [selectedIds, materialMap],
  );

  const filteredChips = useMemo(() => {
    if (!chipSearch) return selectedMaterials;
    const q = chipSearch.toLowerCase();
    return selectedMaterials.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.productAlias?.toLowerCase().includes(q) ||
        m.iflowsProductCode.toLowerCase().includes(q),
    );
  }, [selectedMaterials, chipSearch]);

  const startIndex = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const endIndex = startIndex + parseInt(pageSize, 10);

  const filteredModalData = useMemo(() => {
    if (!globalFilter) return materials;
    const q = globalFilter.toLowerCase();
    return materials.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.productAlias?.toLowerCase().includes(q) ||
        m.iflowsProductCode.toLowerCase().includes(q),
    );
  }, [materials, globalFilter]);

  const paginatedData = useMemo(
    () => filteredModalData.slice(startIndex, endIndex),
    [filteredModalData, startIndex, endIndex],
  );

  const actualPageCount = Math.ceil(
    filteredModalData.length / parseInt(pageSize, 10),
  );

  useEffect(() => {
    if (modalOpen) {
      setModalSelectedIds(new Set(selectedIds));
      setGlobalFilter('');
      setPage('1');
    }
  }, [modalOpen, selectedIds]);

  const columns: ColumnDef<IflowsEquipmentRuleMaterialOption>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => {
          const pageIds = paginatedData.map((m) => m.id);
          const allSelected =
            pageIds.length > 0 &&
            pageIds.every((id) => modalSelectedIds.has(id));
          const someSelected = pageIds.some((id) =>
            modalSelectedIds.has(id),
          );

          return (
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  (el as HTMLInputElement).indeterminate =
                    someSelected && !allSelected;
                }
              }}
              onCheckedChange={(value) => {
                const next = new Set(modalSelectedIds);
                if (value) {
                  pageIds.forEach((id) => next.add(id));
                } else {
                  pageIds.forEach((id) => next.delete(id));
                }
                setModalSelectedIds(next);
              }}
              aria-label={t('materialSelection.selectAll')}
            />
          );
        },
        cell: ({ row }) => {
          const materialId = row.original.id;
          return (
            <Checkbox
              checked={modalSelectedIds.has(materialId)}
              onCheckedChange={(value) => {
                const next = new Set(modalSelectedIds);
                if (value) {
                  next.add(materialId);
                } else {
                  next.delete(materialId);
                }
                setModalSelectedIds(next);
              }}
              aria-label={t('materialSelection.selectRow')}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'productAlias',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('materialSelection.alias')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.productAlias || '—'}
          </div>
        ),
      },
      {
        accessorKey: 'iflowsProductCode',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('materialSelection.iflowsCode')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.original.iflowsProductCode}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: t('materialSelection.name'),
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.name}</div>
        ),
      },
    ],
    [paginatedData, modalSelectedIds, t],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleApply = () => {
    onChange(Array.from(modalSelectedIds));
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    setPage('1');
  };

  const removeMaterial = (materialId: string) => {
    onChange(selectedIds.filter((id) => id !== materialId));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {selectedMaterials.length === 0
            ? t('noMaterialsSelected')
            : t('materialsSelected', { count: selectedMaterials.length })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={disabled || selectedMaterials.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('clearAll')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            disabled={disabled || materials.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('selectMaterials')}
          </Button>
        </div>
      </div>

      <Input
        placeholder={t('searchMaterials')}
        value={chipSearch}
        onChange={(e) => setChipSearch(e.target.value)}
        disabled={disabled || selectedMaterials.length === 0}
        className="max-w-md"
      />

      <ScrollArea className="h-32 w-full rounded-md border p-2">
        <div className="flex flex-wrap gap-2">
          {filteredChips.map((material) => (
            <Badge
              key={material.id}
              variant="secondary"
              className="flex max-w-full items-center gap-1"
              title={material.name}
            >
              <span className="truncate">{materialShortLabel(material)}</span>
              {!disabled && (
                <X
                  className="h-3 w-3 shrink-0 cursor-pointer hover:text-destructive"
                  onClick={() => removeMaterial(material.id)}
                />
              )}
            </Badge>
          ))}
          {selectedMaterials.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('noMaterialsSelected')}</p>
          )}
          {selectedMaterials.length > 0 &&
            filteredChips.length === 0 &&
            chipSearch && (
              <p className="text-sm text-muted-foreground">
                {t('materialSelection.noSearchResults')}
              </p>
            )}
        </div>
      </ScrollArea>

      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen}>
        <ResponsiveModalContent className="w-[calc(100vw-2rem)] lg:max-w-6xl">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {t('materialSelection.title')}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {t('materialSelection.description')}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="space-y-4">
            <Input
              placeholder={t('materialSelection.searchPlaceholder')}
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="rounded-md border">
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
                                  header.getContext(),
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
                          data-state={
                            modalSelectedIds.has(row.original.id) && 'selected'
                          }
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
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {globalFilter
                            ? t('materialSelection.noSearchResults')
                            : t('noMaterials')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </div>

            <Pagination
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
              pageCount={actualPageCount}
            />
          </div>

          <ResponsiveModalFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('materialSelection.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={modalSelectedIds.size === 0}
            >
              {t('materialSelection.apply', {
                count: modalSelectedIds.size,
              })}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
