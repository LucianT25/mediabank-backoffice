'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { routes, submitData } from '@/lib/fetcher';
import { refreshData } from '@/lib/server-actions';
import {
  IflowsEquipmentOption,
  IflowsEquipmentRuleMaterialOption,
  ProductEquipmentRule,
} from '@/interfaces/product.interface';
import { formatConditionPreview } from '@/lib/formula/build-condition';
import ConditionRuleBuilder from './condition-rule-builder';
import EquipmentRuleMaterialPicker from './equipment-rule-material-picker';
import EquipmentRuleMaterialsSummary from './equipment-rule-materials-summary';

interface EquipmentProfilesConfiguratorProps {
  productId: string;
  productName: string;
  productType: string;
  initialRules: ProductEquipmentRule[];
  equipments: IflowsEquipmentOption[];
  materials: IflowsEquipmentRuleMaterialOption[];
}

export default function EquipmentProfilesConfigurator({
  productId,
  productName,
  productType,
  initialRules,
  equipments,
  materials,
}: EquipmentProfilesConfiguratorProps) {
  const t = useTranslations('Products.EquipmentProfiles');
  const { toast } = useToast();
  const { data: session } = useSession();
  const [rules, setRules] = useState<ProductEquipmentRule[]>(initialRules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const equipmentMap = useMemo(
    () => new Map(equipments.map((e) => [e.id, e])),
    [equipments],
  );

  const materialMap = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials],
  );

  const editingRule = rules.find((r) => r.id === editingId);

  const addRule = () => {
    const id = nanoid();
    const next: ProductEquipmentRule = {
      id,
      materialIds: materials[0] ? [materials[0].id] : [],
      equipmentId: equipments[0]?.id ?? '',
      profileId: equipments[0]?.profiles[0]?.id ?? null,
      conditionAst: null,
      quantity: '1',
      digitalFile: false,
      sortOrder: rules.length,
    };
    setRules([...rules, next]);
    setEditingId(id);
  };

  const updateRule = (id: string, patch: Partial<ProductEquipmentRule>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  };

  const handleConditionChange = useCallback(
    (id: string, ast: ProductEquipmentRule['conditionAst']) => {
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === id ? { ...rule, conditionAst: ast } : rule,
        ),
      );
    },
    [],
  );

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await submitData(
        `${routes.iflows}/products/${productId}/equipment-rules`,
        (session as any)?.accessToken,
        { rules },
        'PUT',
      );
      if (response.error) {
        throw new Error('save failed');
      }
      const saved = response.data?.data?.rules ?? rules;
      setRules(saved);
      toast({ title: t('saved') });
      await refreshData(`${routes.iflows}/products/${productId}/equipment-rules`);
    } catch {
      toast({ title: t('saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const equipmentLabel = (id: string) => {
    const eq = equipmentMap.get(id);
    if (!eq) return id;
    return eq.alias ? `${eq.name} (${eq.alias})` : eq.name;
  };

  const profileLabel = (equipmentId: string, profileId?: string | null) => {
    if (!profileId) return '—';
    const eq = equipmentMap.get(equipmentId);
    const profile = eq?.profiles.find((p) => p.id === profileId);
    return profile?.name ?? profileId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('description', { product: productName })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {equipments.length === 0 && (
          <p className="text-sm text-amber-600">{t('noEquipments')}</p>
        )}

        {materials.length === 0 && (
          <p className="text-sm text-amber-600">{t('noMaterials')}</p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('materials')}</TableHead>
              <TableHead>{t('equipment')}</TableHead>
              <TableHead>{t('profile')}</TableHead>
              <TableHead>{t('condition')}</TableHead>
              <TableHead>{t('quantity')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('noRules')}
                </TableCell>
              </TableRow>
            )}
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="max-w-[220px]">
                  <EquipmentRuleMaterialsSummary
                    materialIds={rule.materialIds}
                    materialMap={materialMap}
                  />
                </TableCell>
                <TableCell>{equipmentLabel(rule.equipmentId)}</TableCell>
                <TableCell>
                  {profileLabel(rule.equipmentId, rule.profileId)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatConditionPreview(rule.conditionAst)}
                </TableCell>
                <TableCell>{rule.quantity ?? '1'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(rule.id)}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addRule}>
            {t('addRule')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>

        {editingRule && (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">{t('editRule')}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>{t('materials')}</Label>
                <EquipmentRuleMaterialPicker
                  materials={materials}
                  selectedIds={editingRule.materialIds ?? []}
                  onChange={(materialIds) =>
                    updateRule(editingRule.id, { materialIds })
                  }
                  disabled={materials.length === 0}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('equipment')}</Label>
                <Select
                  value={editingRule.equipmentId}
                  onValueChange={(v) => {
                    const eq = equipmentMap.get(v);
                    updateRule(editingRule.id, {
                      equipmentId: v,
                      profileId: eq?.profiles[0]?.id ?? null,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.alias ? `${eq.name} (${eq.alias})` : eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('profile')}</Label>
                <Select
                  value={editingRule.profileId ?? '__none__'}
                  onValueChange={(v) =>
                    updateRule(editingRule.id, {
                      profileId: v === '__none__' ? null : v,
                    })
                  }
                  disabled={
                    !equipmentMap.get(editingRule.equipmentId)?.profiles.length
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('noProfile')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noProfile')}</SelectItem>
                    {(equipmentMap.get(editingRule.equipmentId)?.profiles ??
                      []
                    ).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('quantity')}</Label>
                <Input
                  value={editingRule.quantity ?? '1'}
                  onChange={(e) =>
                    updateRule(editingRule.id, { quantity: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id={`digital-${editingRule.id}`}
                  type="checkbox"
                  checked={Boolean(editingRule.digitalFile)}
                  onChange={(e) =>
                    updateRule(editingRule.id, { digitalFile: e.target.checked })
                  }
                />
                <Label htmlFor={`digital-${editingRule.id}`}>
                  {t('digitalFile')}
                </Label>
              </div>
            </div>

            <ConditionRuleBuilder
              key={editingRule.id}
              productType={productType}
              value={editingRule.conditionAst}
              onChange={(ast) =>
                handleConditionChange(editingRule.id, ast)
              }
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingId(null)}
            >
              {t('doneEditing')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
