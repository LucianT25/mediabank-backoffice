/**
 * Compiles a React Flow formula graph (nodes + edges) into a FormulaExpr AST.
 *
 * Mirrors buildFormulaFromNodes in the backoffice pricing configurator:
 * same node types, same handle conventions, same switch-case ordering.
 * Returns null for incomplete graphs (where the string builder emits '?').
 *
 * NOTE: mirror of mediabank-api/src/components/formula/compile-graph.ts —
 * keep both copies in sync.
 */
import {
  ArithmeticOp,
  CompareOp,
  FormulaExpr,
  LogicOp,
  MaterialField,
} from './formula-expr';

export interface FlowNode {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface FlowEdge {
  source: string;
  target: string;
  targetHandle?: string | null;
}

const ARITHMETIC_OPS: readonly string[] = ['+', '-', '*', '/'];
const COMPARE_OPS: readonly string[] = ['==', '!=', '>', '<', '>=', '<='];
const LOGIC_OPS: readonly string[] = ['and', 'or'];

export function compileGraphToExpr(
  nodes: FlowNode[],
  edges: FlowEdge[],
  outputNodeId = 'output',
): FormulaExpr | null {
  const outputEdge = edges.find((e) => e.target === outputNodeId);
  if (!outputEdge) return null;
  return compileNode(nodes, edges, outputEdge.source);
}

function compileNode(
  nodes: FlowNode[],
  edges: FlowEdge[],
  id: string,
): FormulaExpr | null {
  const node = nodes.find((n) => n.id === id);
  if (!node) return null;
  const data = node.data ?? {};

  switch (node.type) {
    case 'constant': {
      const value = Number(data.value);
      if (!Number.isFinite(value)) return null;
      return { kind: 'literal', value };
    }

    case 'materialPrice': {
      const materialId = data.value;
      if (typeof materialId !== 'string' || !materialId) return null;
      return { kind: 'materialRef', materialId };
    }

    case 'constantMaterialValue': {
      const valueType = (data.valueType as MaterialField) || 'id';
      const materialId = data.materialId;
      if (typeof materialId !== 'string' || !materialId) return null;
      if (valueType === 'id') return { kind: 'materialId', materialId };
      return { kind: 'materialById', materialId, field: valueType };
    }

    case 'variableMaterialValue': {
      const valueType = (data.valueType as MaterialField) || 'price';
      const role = data.materialVariable;
      if (typeof role !== 'string' || !role) return null;
      return { kind: 'material', role, field: valueType };
    }

    case 'variable': {
      const name = data.value;
      if (typeof name !== 'string' || !name) return null;
      return { kind: 'variable', name };
    }

    case 'operator':
    case 'logic':
    case 'comparison': {
      const inputs = edges.filter((e) => e.target === id).map((e) => e.source);
      if (inputs.length !== 2) return null;
      const left = compileNode(nodes, edges, inputs[0]);
      const right = compileNode(nodes, edges, inputs[1]);
      if (!left || !right) return null;
      const op = String(data.operator ?? '');
      if (node.type === 'operator' && ARITHMETIC_OPS.includes(op)) {
        return { kind: 'binary', op: op as ArithmeticOp, left, right };
      }
      if (node.type === 'comparison' && COMPARE_OPS.includes(op)) {
        return { kind: 'compare', op: op as CompareOp, left, right };
      }
      if (node.type === 'logic' && LOGIC_OPS.includes(op)) {
        return { kind: 'logic', op: op as LogicOp, left, right };
      }
      return null;
    }

    case 'conditional': {
      const getInput = (handleId: string) =>
        edges.find((e) => e.target === id && e.targetHandle === handleId)
          ?.source;
      const condId = getInput('condition');
      const trueId = getInput('true');
      const falseId = getInput('false');
      if (!condId || !trueId || !falseId) return null;
      const cond = compileNode(nodes, edges, condId);
      const thenExpr = compileNode(nodes, edges, trueId);
      const elseExpr = compileNode(nodes, edges, falseId);
      if (!cond || !thenExpr || !elseExpr) return null;
      return { kind: 'ternary', cond, then: thenExpr, else: elseExpr };
    }

    case 'switch': {
      const getInput = (handleId: string) =>
        edges.find((e) => e.target === id && e.targetHandle === handleId)
          ?.source;
      const inputId = getInput('input');
      if (!inputId) return null;
      const input = compileNode(nodes, edges, inputId);
      if (!input) return null;

      const configuredCases = Array.isArray(data.cases)
        ? (data.cases as { value: number; id: string }[])
        : [];
      const cases: { when: number; then: FormulaExpr }[] = [];
      for (const caseItem of configuredCases) {
        const caseSource = getInput(caseItem.id);
        if (!caseSource) continue;
        const then = compileNode(nodes, edges, caseSource);
        if (!then) return null;
        cases.push({ when: Number(caseItem.value), then });
      }

      const defaultId = getInput('default');
      let defaultExpr: FormulaExpr = { kind: 'literal', value: 0 };
      if (defaultId) {
        const compiled = compileNode(nodes, edges, defaultId);
        if (!compiled) return null;
        defaultExpr = compiled;
      }

      if (cases.length === 0) return defaultExpr;
      // Builder sorts cases ascending and nests ternaries right-to-left.
      cases.sort((a, b) => a.when - b.when);
      return { kind: 'switch', input, cases, default: defaultExpr };
    }

    default:
      return null;
  }
}
