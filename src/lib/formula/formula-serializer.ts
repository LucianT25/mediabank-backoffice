/**
 * Serializes a FormulaExpr AST to the mathjs expression string format
 * produced by the backoffice buildFormulaFromNodes, so the derived string
 * cache stays byte-identical with legacy formulas.
 *
 * NOTE: mirror of mediabank-api/src/components/formula/formula-serializer.ts —
 * keep both copies in sync.
 */
import { FormulaExpr } from './formula-expr';

export function toMathJsString(expr: FormulaExpr): string {
  switch (expr.kind) {
    case 'literal':
      return String(expr.value);
    case 'materialId':
      return `"${expr.materialId}"`;
    case 'variable':
      return expr.name;
    case 'material':
      return `${expr.field}["${expr.role}"]`;
    case 'materialById':
      return `${expr.field}["${expr.materialId}"]`;
    case 'materialRef':
      return expr.materialId;
    case 'binary':
    case 'compare':
    case 'logic':
      return `(${toMathJsString(expr.left)} ${expr.op} ${toMathJsString(expr.right)})`;
    case 'ternary':
      return `(${toMathJsString(expr.cond)} ? ${toMathJsString(expr.then)} : ${toMathJsString(expr.else)})`;
    case 'switch': {
      // Matches builder: nested ternaries built right-to-left over ascending cases,
      // repeating the input expression per case.
      const input = toMathJsString(expr.input);
      let out = toMathJsString(expr.default);
      for (let i = expr.cases.length - 1; i >= 0; i -= 1) {
        const { when, then } = expr.cases[i];
        out = `(${input} == ${when} ? ${toMathJsString(then)} : ${out})`;
      }
      return out;
    }
  }
}
