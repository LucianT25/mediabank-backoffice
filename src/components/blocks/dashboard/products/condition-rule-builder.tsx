'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CompareOp, FormulaExpr, LogicOp } from '@/lib/formula/formula-expr';
import {
  buildConditionAst,
  ConditionComparison,
  formatConditionPreview,
} from '@/lib/formula/build-condition';
import { getFormulaVariables } from '@/lib/formula/formula-variables';

const COMPARE_OPS: { value: CompareOp; label: string }[] = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '==', label: '=' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '!=', label: '!=' },
];

const LOGIC_OPS: { value: LogicOp; label: string }[] = [
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
];

type OperandSide = 'variable' | 'literal';

interface ComparisonRow {
  leftKind: OperandSide;
  leftVariable: string;
  leftLiteral: string;
  op: CompareOp;
  rightKind: OperandSide;
  rightVariable: string;
  rightLiteral: string;
}

const defaultRow = (): ComparisonRow => ({
  leftKind: 'variable',
  leftVariable: 'graphicArea',
  leftLiteral: '0',
  op: '>',
  rightKind: 'literal',
  rightLiteral: '0',
  rightVariable: 'graphicArea',
});

function operandFromAst(
  expr: FormulaExpr,
): { kind: OperandSide; variable: string; literal: string } {
  if (expr.kind === 'variable') {
    return { kind: 'variable', variable: expr.name, literal: '0' };
  }
  if (expr.kind === 'literal') {
    return { kind: 'literal', variable: 'graphicArea', literal: String(expr.value) };
  }
  return { kind: 'literal', variable: 'graphicArea', literal: '0' };
}

function flattenAst(
  expr: FormulaExpr | null | undefined,
): { rows: ComparisonRow[]; joiners: LogicOp[] } {
  if (!expr) {
    return { rows: [defaultRow()], joiners: [] };
  }

  if (expr.kind === 'compare') {
    const left = operandFromAst(expr.left);
    const right = operandFromAst(expr.right);
    return {
      rows: [
        {
          leftKind: left.kind,
          leftVariable: left.variable,
          leftLiteral: left.literal,
          op: expr.op,
          rightKind: right.kind,
          rightVariable: right.variable,
          rightLiteral: right.literal,
        },
      ],
      joiners: [],
    };
  }

  if (expr.kind === 'logic') {
    const leftFlat = flattenAst(expr.left);
    const rightFlat = flattenAst(expr.right);
    return {
      rows: [...leftFlat.rows, ...rightFlat.rows],
      joiners: [
        ...leftFlat.joiners,
        expr.op,
        ...rightFlat.joiners,
      ],
    };
  }

  return { rows: [defaultRow()], joiners: [] };
}

function rowToComparison(row: ComparisonRow): ConditionComparison {
  const left =
    row.leftKind === 'variable'
      ? { kind: 'variable' as const, name: row.leftVariable }
      : { kind: 'literal' as const, value: Number(row.leftLiteral) || 0 };
  const right =
    row.rightKind === 'variable'
      ? { kind: 'variable' as const, name: row.rightVariable }
      : { kind: 'literal' as const, value: Number(row.rightLiteral) || 0 };

  return { left, op: row.op, right };
}

interface ConditionRuleBuilderProps {
  productType?: string;
  value?: FormulaExpr | null;
  onChange: (ast: FormulaExpr | null) => void;
}

export default function ConditionRuleBuilder({
  productType,
  value,
  onChange,
}: ConditionRuleBuilderProps) {
  const t = useTranslations('Products.EquipmentProfiles');
  const tPe = useTranslations('Manufacturers.PriceEngine');
  const variables = useMemo(() => getFormulaVariables(productType), [productType]);

  const initial = useMemo(() => flattenAst(value), [value]);
  const [rows, setRows] = useState<ComparisonRow[]>(initial.rows);
  const [joiners, setJoiners] = useState<LogicOp[]>(initial.joiners);
  const [alwaysApply, setAlwaysApply] = useState(!value);

  const computedAst = useMemo(() => {
    if (alwaysApply) return null;
    return buildConditionAst(rows.map(rowToComparison), joiners);
  }, [rows, joiners, alwaysApply]);

  useEffect(() => {
    const flat = flattenAst(value);
    setRows(flat.rows.length ? flat.rows : [defaultRow()]);
    setJoiners(flat.joiners);
    setAlwaysApply(!value);
  }, [value]);

  useEffect(() => {
    onChange(computedAst);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parent passes stable callback
  }, [computedAst]);

  const preview = alwaysApply
    ? t('alwaysApply')
    : formatConditionPreview(computedAst);

  const variableLabel = (name: string) => {
    try {
      return tPe(name);
    } catch {
      return name;
    }
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <input
          id="always-apply"
          type="checkbox"
          checked={alwaysApply}
          onChange={(e) => setAlwaysApply(e.target.checked)}
        />
        <Label htmlFor="always-apply">{t('alwaysApply')}</Label>
      </div>

      {!alwaysApply && (
        <>
          {rows.map((row, index) => (
            <div key={index} className="space-y-2">
              {index > 0 && (
                <Select
                  value={joiners[index - 1] ?? 'and'}
                  onValueChange={(v) => {
                    const next = [...joiners];
                    next[index - 1] = v as LogicOp;
                    setJoiners(next);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGIC_OPS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('leftOperand')}</Label>
                  <Select
                    value={row.leftKind}
                    onValueChange={(v) => {
                      const next = [...rows];
                      next[index] = { ...row, leftKind: v as OperandSide };
                      setRows(next);
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">{t('variable')}</SelectItem>
                      <SelectItem value="literal">{t('constant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {row.leftKind === 'variable' ? (
                  <Select
                    value={row.leftVariable}
                    onValueChange={(v) => {
                      const next = [...rows];
                      next[index] = { ...row, leftVariable: v };
                      setRows(next);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {variables.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {variableLabel(v.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    className="w-28"
                    value={row.leftLiteral}
                    onChange={(e) => {
                      const next = [...rows];
                      next[index] = { ...row, leftLiteral: e.target.value };
                      setRows(next);
                    }}
                  />
                )}

                <Select
                  value={row.op}
                  onValueChange={(v) => {
                    const next = [...rows];
                    next[index] = { ...row, op: v as CompareOp };
                    setRows(next);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARE_OPS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                  <Label className="text-xs">{t('rightOperand')}</Label>
                  <Select
                    value={row.rightKind}
                    onValueChange={(v) => {
                      const next = [...rows];
                      next[index] = { ...row, rightKind: v as OperandSide };
                      setRows(next);
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">{t('variable')}</SelectItem>
                      <SelectItem value="literal">{t('constant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {row.rightKind === 'variable' ? (
                  <Select
                    value={row.rightVariable}
                    onValueChange={(v) => {
                      const next = [...rows];
                      next[index] = { ...row, rightVariable: v };
                      setRows(next);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {variables.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {variableLabel(v.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    className="w-28"
                    value={row.rightLiteral}
                    onChange={(e) => {
                      const next = [...rows];
                      next[index] = { ...row, rightLiteral: e.target.value };
                      setRows(next);
                    }}
                  />
                )}

                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const nextRows = rows.filter((_, i) => i !== index);
                      const nextJoiners = joiners.filter((_, i) => i !== index - 1);
                      setRows(nextRows.length ? nextRows : [defaultRow()]);
                      setJoiners(nextJoiners);
                    }}
                  >
                    {t('removeComparison')}
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setRows([...rows, defaultRow()]);
              setJoiners([...joiners, 'and']);
            }}
          >
            {t('addComparison')}
          </Button>
        </>
      )}

      <p className="text-sm text-muted-foreground">
        {t('preview')}: <span className="font-mono">{preview}</span>
      </p>
    </div>
  );
}
