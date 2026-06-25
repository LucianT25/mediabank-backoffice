'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { IflowsEquipmentRuleMaterialOption } from '@/interfaces/product.interface';
import { materialShortLabel } from './equipment-rule-material-picker';

interface EquipmentRuleMaterialsSummaryProps {
  materialIds: string[] | undefined;
  materialMap: Map<string, IflowsEquipmentRuleMaterialOption>;
}

export default function EquipmentRuleMaterialsSummary({
  materialIds,
  materialMap,
}: EquipmentRuleMaterialsSummaryProps) {
  const t = useTranslations('Products.EquipmentProfiles');

  const materials = useMemo(
    () =>
      (materialIds ?? [])
        .map((id) => materialMap.get(id))
        .filter((m): m is IflowsEquipmentRuleMaterialOption => Boolean(m)),
    [materialIds, materialMap],
  );

  if (materials.length === 0) {
    return <span>—</span>;
  }

  const preview = materials
    .slice(0, 2)
    .map((m) => materialShortLabel(m))
    .join(', ');
  const summary =
    materials.length <= 2
      ? preview
      : t('materialsSummary', {
          count: materials.length,
          preview,
        });

  if (materials.length <= 3) {
    return <span className="truncate">{summary}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="max-w-[220px] truncate text-left underline-offset-4 hover:underline"
        >
          {summary}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b px-3 py-2 text-sm font-medium">
          {t('materialsSelected', { count: materials.length })}
        </div>
        <ul className="max-h-60 overflow-auto p-2 text-sm">
          {materials.map((m) => (
            <li key={m.id} className="rounded px-2 py-1.5 hover:bg-muted">
              <div className="font-medium">{materialShortLabel(m)}</div>
              <div className="truncate text-xs text-muted-foreground">
                {m.iflowsProductCode} · {m.name}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
