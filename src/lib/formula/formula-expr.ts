/**
 * Canonical semantic AST for product pricing formulas.
 *
 * Compiled from the backoffice React Flow graph on save and stored as JSONB
 * (`priceFormulaAst`, `mountingFormulaAst`, `extrasFormulaAst` on products).
 * The mathjs string formula is a derived cache of this tree.
 *
 * NOTE: mirror of mediabank-api/src/components/formula/formula-expr.ts —
 * keep both copies in sync.
 */

export const MATERIAL_ROLES = [
  'faceMaterial',
  'sideMaterial',
  'ledMaterial',
  'extraMaterial',
] as const;

export type MaterialRole = (typeof MATERIAL_ROLES)[number];

export type MaterialField = 'price' | 'weight' | 'consumption' | 'id';

export type ArithmeticOp = '+' | '-' | '*' | '/';
export type CompareOp = '==' | '!=' | '>' | '<' | '>=' | '<=';
export type LogicOp = 'and' | 'or';

export type FormulaExpr =
  /** Numeric constant. */
  | { kind: 'literal'; value: number }
  /** Material ID string literal, e.g. "MB0000001" (used in equality checks). */
  | { kind: 'materialId'; materialId: string }
  /** Named context variable, e.g. graphicArea, cutPerimeter, mounting. */
  | { kind: 'variable'; name: string }
  /** Lookup by configured material role, e.g. price["faceMaterial"]. */
  | { kind: 'material'; role: string; field: MaterialField }
  /** Lookup by literal material ID, e.g. price["MB0000001"]. */
  | {
      kind: 'materialById';
      materialId: string;
      field: Exclude<MaterialField, 'id'>;
    }
  /** Bare material reference, e.g. MB0000001 — resolves to its unit price. */
  | { kind: 'materialRef'; materialId: string }
  | { kind: 'binary'; op: ArithmeticOp; left: FormulaExpr; right: FormulaExpr }
  | { kind: 'compare'; op: CompareOp; left: FormulaExpr; right: FormulaExpr }
  | { kind: 'logic'; op: LogicOp; left: FormulaExpr; right: FormulaExpr }
  | { kind: 'ternary'; cond: FormulaExpr; then: FormulaExpr; else: FormulaExpr }
  | {
      kind: 'switch';
      input: FormulaExpr;
      cases: { when: number; then: FormulaExpr }[];
      default: FormulaExpr;
    };

/** Runtime guard for values loaded from JSONB. */
export function isFormulaExpr(value: unknown): value is FormulaExpr {
  if (!value || typeof value !== 'object') return false;
  const kind = (value as { kind?: unknown }).kind;
  return (
    typeof kind === 'string' &&
    [
      'literal',
      'materialId',
      'variable',
      'material',
      'materialById',
      'materialRef',
      'binary',
      'compare',
      'logic',
      'ternary',
      'switch',
    ].includes(kind)
  );
}
