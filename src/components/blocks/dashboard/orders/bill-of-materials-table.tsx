import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/currency";

export interface BomLine {
  orderItemId: string;
  elementId?: string;
  role: string;
  materialId: string;
  materialName: string;
  productAlias?: string;
  colorCode?: string;
  salesUnit?: string;
  unitPrice: number;
  usagePerSign?: number;
  weightKg?: number;
  quantity: number;
  lineTotal?: number;
}

function formatUsage(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function BillOfMaterialsTable({ lines }: { lines: BomLine[] }) {
  const t = useTranslations("Fulfillments.Details");

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0),
    [lines],
  );

  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">{t("noBomData")}</p>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("bomMaterial")}</TableHead>
            <TableHead>{t("bomRole")}</TableHead>
            <TableHead>{t("bomElement")}</TableHead>
            <TableHead>{t("bomUnit")}</TableHead>
            <TableHead className="text-right">{t("bomUsagePerSign")}</TableHead>
            <TableHead className="text-right">{t("bomQuantity")}</TableHead>
            <TableHead className="text-right">{t("bomUnitPrice")}</TableHead>
            <TableHead className="text-right">{t("bomLineTotal")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow key={`${line.orderItemId}-${line.role}-${line.materialId}-${index}`}>
              <TableCell>
                <div className="font-medium">{line.materialName}</div>
                {line.productAlias && (
                  <div className="text-xs text-muted-foreground">{line.productAlias}</div>
                )}
              </TableCell>
              <TableCell>{line.role}</TableCell>
              <TableCell>{line.elementId ?? "—"}</TableCell>
              <TableCell>{line.salesUnit ?? "—"}</TableCell>
              <TableCell className="text-right">
                {line.usagePerSign != null ? formatUsage(line.usagePerSign) : "—"}
              </TableCell>
              <TableCell className="text-right">{line.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(line.lineTotal ?? 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right font-semibold">
              {t("bomSubtotal")}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(subtotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
