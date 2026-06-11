"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Download, ChevronsLeftRight, ChevronsUpDown, SquareDashed, ChevronDownIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { routes } from "@/lib/fetcher";
import { useFetcher } from "@/hooks/use-fetcher";
import { OrderItem } from "@/interfaces/order.interface";

function downloadSVG(svgString: string, filename = "graphic.svg") {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadJSON(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

type NestingMeasurement = {
    type: string;
    fits: boolean;
    sheetAreaM2: number;
    sheetWidthMm: number;
    sheetHeightMm: number;
    usedHeightMm: number;
    sheetName?: string;
    preview: string;
};

type MeasurementsResponse = {
    cutPerimeterM: number;
    graphicAreaM2: number;
    measurementPreview: string;
    bondGraphicAreaM2?: number;
    bondCutPerimeterM?: number;
    bondMeasurementPreview?: string;
    nesting: NestingMeasurement[];
};

const NESTING_FORMULA_KEYS: Record<string, string> = {
    plexi: "plexiNestingResult",
    oracal: "oracalNestingResult",
    bond: "bondNestingResult",
    cutBond: "cutBondNestingResult",
};

function usesNestingType(item: OrderItem | undefined, type: string): boolean {
    const key = NESTING_FORMULA_KEYS[type];
    if (!key) return false;
    if (type === "cutBond") {
        return !!item?.product?.priceFormula?.includes(key) ||
            !!item?.product?.mountingFormula?.includes(key);
    }
    return !!item?.product?.priceFormula?.includes(key);
}

function DownloadLink({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
            <Download className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}

function SvgPreviewPanel({
    svg,
    alt,
}: {
    svg?: string;
    alt: string;
}) {
    if (!svg) {
        return (
            <div className="relative w-full aspect-[16/10] min-h-[180px] max-h-[380px] rounded bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
                No preview available
            </div>
        );
    }
    return (
        <div
            className="relative w-full aspect-[16/10] min-h-[180px] max-h-[380px] rounded bg-muted/40 overflow-hidden [&_svg]:h-full [&_svg]:w-full [&_svg]:block"
            role="img"
            aria-label={alt}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

function MetricInline({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold mt-0.5">{value}</p>
        </div>
    );
}

function SubsectionHeading({
    title,
    hint,
    actions,
}: {
    title: string;
    hint?: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h4 className="text-sm font-semibold">{title}</h4>
                {hint ? <p className="text-xs text-muted-foreground mt-0.5">{hint}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
        </div>
    );
}

function NestingRow({
    nesting,
    t,
    downloadSuffix,
}: {
    nesting: NestingMeasurement;
    t: ReturnType<typeof useTranslations>;
    downloadSuffix?: string;
}) {
    const typeLabel =
        nesting.type === "cutBond"
            ? t("Manufacturers.PriceEngine.cutBondNesting")
            : t(`Manufacturers.PriceEngine.${nesting.type}` as "Manufacturers.PriceEngine.plexi");

    return (
        <div className="space-y-3 pt-4 first:pt-0">
            <SubsectionHeading
                title={typeLabel}
                actions={
                    <DownloadLink
                        label={t("Manufacturers.PriceEngine.download")}
                        onClick={() =>
                            downloadSVG(
                                nesting.preview,
                                downloadSuffix
                                    ? `${nesting.type}-${downloadSuffix}-nesting.svg`
                                    : `${nesting.type}-nesting.svg`,
                            )
                        }
                    />
                }
            />
            <SvgPreviewPanel svg={nesting.preview} alt={`${nesting.type} nesting layout`} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                    <ChevronsLeftRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <MetricInline
                        label={t("Manufacturers.PriceEngine.sheetWidth")}
                        value={`${nesting.sheetWidthMm?.toFixed(2)} mm`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <MetricInline
                        label={t("Manufacturers.PriceEngine.sheetHeight")}
                        value={`${nesting.sheetHeightMm?.toFixed(2)} mm`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <SquareDashed className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <MetricInline
                        label={t("Manufacturers.PriceEngine.usedHeight")}
                        value={`${nesting.usedHeightMm?.toFixed(2)} mm`}
                    />
                </div>
                <MetricInline
                    label={t("Orders.Item.measurementsSheetUsage")}
                    value={`${nesting.sheetAreaM2?.toFixed(4)} m²`}
                />
            </div>
        </div>
    );
}

export function MeasurementsSection({
    item,
    elementId,
    elementIndex,
    downloadSuffix,
}: {
    item: OrderItem;
    elementId?: string;
    elementIndex?: number;
    downloadSuffix?: string;
}) {
    const t = useTranslations();
    const { data: session } = useSession();

    const queryParams: Record<string, string | undefined> = {
        orderItemId: item.id,
    };
    if (elementId) {
        queryParams.elementId = elementId;
    } else if (elementIndex != null) {
        queryParams.elementIndex = String(elementIndex);
    }

    const { data, isLoading, isError } = useFetcher({
        route: `${routes.priceEngine}/measurements`,
        token: (session as { accessToken?: string })?.accessToken ?? "",
        queryParams,
    });

    const measurements = data as MeasurementsResponse | undefined;
    const visibleNesting = (measurements?.nesting ?? []).filter((n) =>
        usesNestingType(item, n.type),
    );

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Orders.Item.measurementsLoading")}
            </div>
        );
    }

    if (isError || !measurements) {
        return (
            <p className="text-sm text-muted-foreground py-2">
                {t("Orders.Item.measurementsUnavailable")}
            </p>
        );
    }

    const summaryFilename = downloadSuffix
        ? `measurements-${downloadSuffix}.json`
        : "measurements.json";

    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <SubsectionHeading
                    title={t("Orders.Item.measurementsDesign")}
                    hint={t("Orders.Item.measurementsDesignHint")}
                    actions={
                        <>
                            <DownloadLink
                                label={t("Orders.Item.downloadMeasurementSvg")}
                                onClick={() =>
                                    downloadSVG(
                                        measurements.measurementPreview,
                                        downloadSuffix
                                            ? `measurement-${downloadSuffix}.svg`
                                            : "measurement.svg",
                                    )
                                }
                            />
                            <DownloadLink
                                label={t("Orders.Item.downloadMeasurementsJson")}
                                onClick={() => downloadJSON(measurements, summaryFilename)}
                            />
                        </>
                    }
                />
                <SvgPreviewPanel
                    svg={measurements.measurementPreview}
                    alt="Measurement geometry preview"
                />
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-blue-400/40" />
                        {t("Manufacturers.PriceEngine.graphicArea")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-0.5 w-4 bg-red-600" />
                        {t("Manufacturers.PriceEngine.cutPerimeter")}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:max-w-md">
                    <MetricInline
                        label={t("Manufacturers.PriceEngine.graphicArea")}
                        value={`${measurements.graphicAreaM2.toFixed(4)} m²`}
                    />
                    <MetricInline
                        label={t("Manufacturers.PriceEngine.cutPerimeter")}
                        value={`${measurements.cutPerimeterM.toFixed(3)} m`}
                    />
                </div>
            </div>

            {measurements.bondMeasurementPreview ? (
                <div className="space-y-3 pt-5 border-t">
                    <SubsectionHeading
                        title={t("Orders.Item.measurementsBondDesign")}
                        hint={t("Orders.Item.measurementsBondDesignHint")}
                        actions={
                            <DownloadLink
                                label={t("Orders.Item.downloadMeasurementSvg")}
                                onClick={() =>
                                    downloadSVG(
                                        measurements.bondMeasurementPreview!,
                                        downloadSuffix
                                            ? `bond-measurement-${downloadSuffix}.svg`
                                            : "bond-measurement.svg",
                                    )
                                }
                            />
                        }
                    />
                    <SvgPreviewPanel
                        svg={measurements.bondMeasurementPreview}
                        alt="Cut bond measurement preview"
                    />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:max-w-md">
                        <MetricInline
                            label={t("Orders.Item.bondGraphicArea")}
                            value={`${(measurements.bondGraphicAreaM2 ?? 0).toFixed(4)} m²`}
                        />
                        <MetricInline
                            label={t("Orders.Item.bondCutPerimeter")}
                            value={`${(measurements.bondCutPerimeterM ?? 0).toFixed(3)} m`}
                        />
                    </div>
                </div>
            ) : null}

            {visibleNesting.length > 0 ? (
                <div className="pt-5 border-t space-y-1">
                    <SubsectionHeading
                        title={t("Manufacturers.PriceEngine.nesting")}
                        hint={t("Orders.Item.measurementsNestingHint")}
                    />
                    <div className="divide-y">
                        {visibleNesting.map((n) => (
                            <NestingRow
                                key={n.type}
                                nesting={n}
                                t={t}
                                downloadSuffix={downloadSuffix}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function getElementLabel(
    el: Record<string, unknown>,
    index: number,
    t: ReturnType<typeof useTranslations>,
): string {
    const elType = String(el.signType ?? el.type ?? "text");
    const base = t("Orders.Item.elementLabel", { index: index + 1 });
    if (elType === "text") {
        const text = String(el.text ?? "").trim();
        return text ? `${base} — ${text}` : `${base} — ${t("Orders.Item.elementText")}`;
    }
    const svgName = String(el.svgName ?? "").trim();
    return svgName ? `${base} — ${svgName}` : `${base} — ${t("Orders.Item.elementSvg")}`;
}

export function OrderItemMeasurementsBlock({
    item,
    hasElements,
    elements,
    t,
}: {
    item: OrderItem;
    hasElements: boolean;
    elements: Record<string, unknown>[];
    t: ReturnType<typeof useTranslations>;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="group">
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 rounded-md py-1 text-left hover:text-foreground/80 transition-colors">
                <h5 className="font-bold">{t("Orders.Item.measurements")}</h5>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
                {open ? (
                    hasElements ? (
                        <div className="space-y-6">
                            {elements.map((el, idx) => {
                                const elementId = el.id != null ? String(el.id) : undefined;
                                const downloadSuffix = elementId ?? `element-${idx + 1}`;
                                return (
                                    <div
                                        key={String(el.id ?? idx)}
                                        className={idx > 0 ? "pt-6 border-t" : undefined}
                                    >
                                        <p className="text-sm font-medium text-muted-foreground mb-3">
                                            {getElementLabel(el, idx, t)}
                                        </p>
                                        <MeasurementsSection
                                            item={item}
                                            elementId={elementId}
                                            elementIndex={elementId ? undefined : idx}
                                            downloadSuffix={downloadSuffix}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <MeasurementsSection item={item} />
                    )
                ) : null}
            </CollapsibleContent>
        </Collapsible>
    );
}
