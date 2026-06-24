import type { CompareOp, FormulaExpr, LogicOp } from './formula-expr';

export interface ConditionComparison {
  left: { kind: 'variable'; name: string } | { kind: 'literal'; value: number };
  op: CompareOp;
  right: { kind: 'variable'; name: string } | { kind: 'literal'; value: number };
}

export function buildConditionAst(
  comparisons: ConditionComparison[],
  joiners: LogicOp[],
): FormulaExpr | null {
  if (comparisons.length === 0) return null;
  if (comparisons.length === 1) {
    const c = comparisons[0];
    return {
      kind: 'compare',
      op: c.op,
      left: c.left,
      right: c.right,
    };
  }

  let expr: FormulaExpr = {
    kind: 'compare',
    op: comparisons[0].op,
    left: comparisons[0].left,
    right: comparisons[0].right,
  };

  for (let i = 1; i < comparisons.length; i += 1) {
    const joiner = joiners[i - 1] ?? 'and';
    expr = {
      kind: 'logic',
      op: joiner,
      left: expr,
      right: {
        kind: 'compare',
        op: comparisons[i].op,
        left: comparisons[i].left,
        right: comparisons[i].right,
      },
    };
  }

  return expr;
}

export function formatConditionPreview(expr: FormulaExpr | null | undefined): string {
  if (!expr) return '—';
  return formatExpr(expr);
}

function formatExpr(expr: FormulaExpr): string {
  switch (expr.kind) {
    case 'literal':
      return String(expr.value);
    case 'variable':
      return expr.name;
    case 'compare':
    case 'logic':
      return `(${formatExpr(expr.left)} ${expr.op} ${formatExpr(expr.right)})`;
    default:
      return '?';
  }
}
