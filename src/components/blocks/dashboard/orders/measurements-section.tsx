"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Download, ChevronsLeftRight, ChevronsUpDown, SquareDashed, ChevronDownIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { SvgImage } from "@/components/ui/svg-image";
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

function DownloadButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
            <Download className="mr-2 h-4 w-4" />
            {label}
        </button>
    );
}

function SvgPreviewPanel({
    svg,
    alt,
    className = "relative w-full aspect-[16/10] min-h-[200px] max-h-[420px] border rounded-md bg-slate-50 overflow-hidden",
}: {
    svg?: string;
    alt: string;
    className?: string;
}) {
    if (!svg) {
        return (
            <div className={`${className} flex items-center justify-center text-sm text-muted-foreground`}>
                No preview available
            </div>
        );
    }
    return (
        <div className={className}>
            <SvgImage svgString={svg} className="object-contain p-2" />
            <span className="sr-only">{alt}</span>
        </div>
    );
}

function MetricCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
            {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
        </div>
    );
}

function NestingCard({
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
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold leading-none tracking-tight capitalize">{typeLabel}</h3>
                    <DownloadButton
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
                </div>
            </div>
            <div className="px-6 pb-4">
                <SvgPreviewPanel
                    svg={nesting.preview}
                    alt={`${nesting.type} nesting layout`}
                />
            </div>
            <div className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <ChevronsLeftRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium leading-none">{t("Manufacturers.PriceEngine.sheetWidth")}</span>
                        </div>
                        <p className="font-semibold">{nesting.sheetWidthMm?.toFixed(2)} mm</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium leading-none">{t("Manufacturers.PriceEngine.sheetHeight")}</span>
                        </div>
                        <p className="font-semibold">{nesting.sheetHeightMm?.toFixed(2)} mm</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <SquareDashed className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium leading-none">{t("Manufacturers.PriceEngine.usedHeight")}</span>
                        </div>
                        <p className="font-semibold">{nesting.usedHeightMm?.toFixed(2)} mm</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium leading-none text-muted-foreground">{t("Orders.Item.measurementsSheetUsage")}</span>
                        <p className="font-semibold">{nesting.sheetAreaM2?.toFixed(4)} m²</p>
                    </div>
                </div>
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Orders.Item.measurementsLoading")}
            </div>
        );
    }

    if (isError || !measurements) {
        return (
            <p className="text-sm text-muted-foreground">
                {t("Orders.Item.measurementsUnavailable")}
            </p>
        );
    }

    const summaryFilename = downloadSuffix
        ? `measurements-${downloadSuffix}.json`
        : "measurements.json";

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{t("Orders.Item.measurementsDesign")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("Orders.Item.measurementsDesignHint")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <DownloadButton
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
                        <DownloadButton
                            label={t("Orders.Item.downloadMeasurementsJson")}
                            onClick={() => downloadJSON(measurements, summaryFilename)}
                        />
                    </div>
                </div>
                <div className="px-6 pb-6">
                    <SvgPreviewPanel
                        svg={measurements.measurementPreview}
                        alt="Measurement geometry preview"
                    />
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <span className="inline-flex items-center gap-2">
                            <span className="inline-block h-3 w-5 rounded-sm bg-blue-400/40 border border-blue-500" />
                            {t("Manufacturers.PriceEngine.graphicArea")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="inline-block h-0.5 w-5 bg-red-600" />
                            {t("Manufacturers.PriceEngine.cutPerimeter")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                    label={t("Manufacturers.PriceEngine.graphicArea")}
                    value={`${measurements.graphicAreaM2.toFixed(4)} m²`}
                    hint={t("Manufacturers.PriceEngine.graphicAreaHint")}
                />
                <MetricCard
                    label={t("Manufacturers.PriceEngine.cutPerimeter")}
                    value={`${measurements.cutPerimeterM.toFixed(3)} m`}
                    hint={t("Manufacturers.PriceEngine.cutPerimeterHint")}
                />
            </div>

            {measurements.bondMeasurementPreview ? (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{t("Orders.Item.measurementsBondDesign")}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t("Orders.Item.measurementsBondDesignHint")}
                            </p>
                        </div>
                        <DownloadButton
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
                    </div>
                    <div className="px-6 pb-6">
                        <SvgPreviewPanel
                            svg={measurements.bondMeasurementPreview}
                            alt="Cut bond measurement preview"
                        />
                    </div>
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MetricCard
                            label={t("Orders.Item.bondGraphicArea")}
                            value={`${(measurements.bondGraphicAreaM2 ?? 0).toFixed(4)} m²`}
                        />
                        <MetricCard
                            label={t("Orders.Item.bondCutPerimeter")}
                            value={`${(measurements.bondCutPerimeterM ?? 0).toFixed(3)} m`}
                        />
                    </div>
                </div>
            ) : null}

            {visibleNesting.length > 0 ? (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">{t("Manufacturers.PriceEngine.nesting")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("Orders.Item.measurementsNestingHint")}
                        </p>
                    </div>
                    {visibleNesting.map((n) => (
                        <NestingCard
                            key={n.type}
                            nesting={n}
                            t={t}
                            downloadSuffix={downloadSuffix}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function CollapsibleMeasurementsPanel({
    title,
    subtitle,
    defaultOpen = false,
    children,
}: {
    title: string;
    subtitle?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="group rounded-md border">
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 rounded-md transition-colors">
                <div className="min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    {subtitle ? (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
                    ) : null}
                </div>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
                {open ? children : null}
            </CollapsibleContent>
        </Collapsible>
    );
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
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-muted/40 transition-colors">
                <h5 className="font-bold">{t("Orders.Item.measurements")}</h5>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
                {open ? (
                    hasElements ? (
                        elements.map((el, idx) => (
                            <ElementMeasurementsSection
                                key={String(el.id ?? idx)}
                                el={el}
                                index={idx}
                                item={item}
                                t={t}
                            />
                        ))
                    ) : (
                        <MeasurementsSection item={item} />
                    )
                ) : null}
            </CollapsibleContent>
        </Collapsible>
    );
}

export function ElementMeasurementsSection({
    el,
    index,
    item,
    t,
}: {
    el: Record<string, unknown>;
    index: number;
    item: OrderItem;
    t: ReturnType<typeof useTranslations>;
}) {
    const elementId = el.id != null ? String(el.id) : undefined;
    const elType = String(el.signType ?? el.type ?? "text");
    const base = t("Orders.Item.elementLabel", { index: index + 1 });
    const label =
        elType === "text"
            ? `${base} — ${String(el.text ?? "").trim() || t("Orders.Item.elementText")}`
            : `${base} — ${String(el.svgName ?? "").trim() || t("Orders.Item.elementSvg")}`;
    const downloadSuffix = elementId ?? `element-${index + 1}`;

    return (
        <CollapsibleMeasurementsPanel title={label}>
            <MeasurementsSection
                item={item}
                elementId={elementId}
                elementIndex={elementId ? undefined : index}
                downloadSuffix={downloadSuffix}
            />
        </CollapsibleMeasurementsPanel>
    );
}
