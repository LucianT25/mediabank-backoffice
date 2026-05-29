import { Product, ProductType } from "@/interfaces/product.interface";
import { OrderItem } from "@/interfaces/order.interface";
import { SvgImage } from "@/components/ui/svg-image";
import * as React from "react";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { AdminType } from "@/interfaces/user.interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderFulfillment, OrderFulfillmentItemStatus } from "@/interfaces/order-fulfillment.interface";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslations, useLocale } from "next-intl";
import { Mountings } from "@/lib/const";
import { routes } from "@/lib/fetcher";
import { useFetcher } from "@/hooks/use-fetcher";
import { getCustomizationLabel } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { buildConfiguratorUrl } from "@/lib/configurator-url";
import { ChevronsLeftRight, ChevronsUpDown, ExternalLink, Loader2, SquareDashed } from "lucide-react";

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

function getItemConfig(item: OrderItem): Record<string, unknown> | null {
    const raw = item.configuration as unknown;
    if (!raw || typeof raw !== "object") return null;
    return raw as Record<string, unknown>;
}

function getElements(cfg: Record<string, unknown> | null): Record<string, unknown>[] {
    if (!cfg) return [];
    const elements = cfg.elements ?? cfg.innerElements;
    return Array.isArray(elements) ? (elements as Record<string, unknown>[]) : [];
}

function isBoxConfig(cfg: Record<string, unknown> | null): boolean {
    return !!cfg && "innerElements" in cfg && "boxSettings" in cfg;
}

function getSignSettings(cfg: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!cfg) return null;
    if (isBoxConfig(cfg)) {
        return (cfg.boxSettings as Record<string, unknown>) ?? cfg;
    }
    return (
        (cfg.signMountingSettings as Record<string, unknown> | undefined) ??
        (cfg.settings as Record<string, unknown> | undefined) ??
        cfg
    );
}

function getElementType(el: Record<string, unknown>): string {
    return String(el.signType ?? el.type ?? "text");
}

function hasMaterialFields(source: Record<string, unknown> | null | undefined): boolean {
    if (!source) return false;
    return !!(source.faceMaterial || source.sideMaterial || source.extraMaterial || source.ledMaterial);
}

function isPresent(value: unknown): boolean {
    return value != null && value !== "";
}

function displayValue(value: unknown, fallback = "-"): string {
    if (value == null || value === "") return fallback;
    return String(value);
}

const MaterialDisplay = ({ materialId }: { materialId?: string }) => {
    const { data: session } = useSession();
    const { data: material, isLoading } = useFetcher({
        route: materialId ? `${routes.material}/${materialId}` : undefined,
        token: (session as any)?.accessToken,
        queryParams: ""
    });

    return <span>{isLoading ? <Loader2 className="animate-spin" /> : (material?.productAlias ?? '-')}</span>
}

const MaterialsGrid = ({
    source,
    t,
}: {
    source: Record<string, unknown> | null | undefined;
    t: ReturnType<typeof useTranslations>;
}) => {
    if (!source || !hasMaterialFields(source)) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isPresent(source.faceMaterial) ? (
                <div>
                    <p className="text-sm text-muted-foreground">{t('Orders.Item.faceMaterial')}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <MaterialDisplay materialId={String(source.faceMaterial)} />
                    </div>
                </div>
            ) : null}
            {isPresent(source.sideMaterial) ? (
                <div>
                    <p className="text-sm text-muted-foreground">{t('Orders.Item.sideMaterial')}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <MaterialDisplay materialId={String(source.sideMaterial)} />
                    </div>
                </div>
            ) : null}
            {isPresent(source.extraMaterial) ? (
                <div>
                    <p className="text-sm text-muted-foreground">{t('Orders.Item.extraMaterial')}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <MaterialDisplay materialId={String(source.extraMaterial)} />
                    </div>
                </div>
            ) : null}
            {isPresent(source.ledMaterial) ? (
                <div>
                    <p className="text-sm text-muted-foreground">{t('Orders.Item.ledMaterial')}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <MaterialDisplay materialId={String(source.ledMaterial)} />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const ElementContentCard = ({
    el,
    index,
    t,
}: {
    el: Record<string, unknown>;
    index: number;
    t: ReturnType<typeof useTranslations>;
}) => {
    const elType = getElementType(el);

    return (
        <div className="border rounded-md p-3 space-y-2 mr-2">
            <p className="text-sm font-semibold">
                {t('Orders.Item.elementLabel', { index: index + 1 })}{' '}
                {elType === 'text' ? t('Orders.Item.elementText') : t('Orders.Item.elementSvg')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {elType === 'text' ? (
                    <>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('Orders.Item.text')}</p>
                            <p className="font-medium">{String(el.text ?? '')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('Orders.Item.font')}</p>
                            <p>{String(el.font ?? '')}</p>
                        </div>
                    </>
                ) : (
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Orders.Item.svgData')}</p>
                        <div
                            className="relative h-8 w-8 hover:cursor-pointer"
                            title="Download"
                            onClick={() => downloadSVG(String(el.svgData ?? ''), String(el.svgName ?? 'graphic.svg'))}
                        >
                            <SvgImage svgString={String(el.svgData ?? '')} />
                        </div>
                        {isPresent(el.svgName) ? (
                            <p className="text-xs text-muted-foreground mt-1">{String(el.svgName)}</p>
                        ) : null}
                    </div>
                )}
                {el.letterHeight != null && (
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Orders.Item.letterHeight')}</p>
                        <p>{String(el.letterHeight)} cm</p>
                    </div>
                )}
                {el.letterWidth != null && (
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Orders.Item.letterWidth')}</p>
                        <p>{Number(el.letterWidth).toFixed()} cm</p>
                    </div>
                )}
                {el.letterSpacing != null && (
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Orders.Item.letterSpacing')}</p>
                        <p>{displayValue(el.letterSpacing)}</p>
                    </div>
                )}
                {isPresent(el.face) ? (
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Orders.Item.face')}</p>
                        <p className="capitalize">{String(el.face)}</p>
                    </div>
                ) : null}
            </div>
            {hasMaterialFields(el) && (
                <div className="pt-2 border-t">
                    <MaterialsGrid source={el} t={t} />
                </div>
            )}
        </div>
    );
};

function getElementNestingLabel(
    el: Record<string, unknown>,
    index: number,
    t: ReturnType<typeof useTranslations>,
): string {
    const elType = getElementType(el);
    const base = t('Orders.Item.elementLabel', { index: index + 1 });
    if (elType === 'text') {
        const text = String(el.text ?? '').trim();
        return text ? `${base} — ${text}` : `${base} — ${t('Orders.Item.elementText')}`;
    }
    const svgName = String(el.svgName ?? '').trim();
    return svgName ? `${base} — ${svgName}` : `${base} — ${t('Orders.Item.elementSvg')}`;
}

const NestingDisplay = ({
    type,
    item,
    elementId,
    elementIndex,
    downloadSuffix,
}: {
    type: string;
    item: OrderItem | undefined;
    elementId?: string;
    elementIndex?: number;
    downloadSuffix?: string;
}) => {
    const t = useTranslations('Manufacturers.PriceEngine');
    const { data: session } = useSession();
    const usesType = item?.product?.priceFormula?.includes(`${type}NestingResult`);

    const queryParams: Record<string, string | undefined> = {
        orderItemId: item?.id,
        type,
    };
    if (elementId) {
        queryParams.elementId = elementId;
    } else if (elementIndex != null) {
        queryParams.elementIndex = String(elementIndex);
    }

    const { data: nestingResult, isLoading } = useFetcher({
        route: usesType ? `${routes.priceEngine}/nesting` : undefined,
        token: (session as any)?.accessToken,
        queryParams,
    });

    if (isLoading) {
        return (
            <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium capitalize">{type}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading nesting data...</span>
                </div>
            </div>
        );
    }

    if (!nestingResult || !usesType) {
        return (
            <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium capitalize">{type}</p>
                <p className="text-sm text-muted-foreground mt-2">No nesting data available</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold leading-none tracking-tight capitalize">{type}</h3>
                    <button
                        onClick={() =>
                            downloadSVG(
                                nestingResult.preview,
                                downloadSuffix
                                    ? `${type}-${downloadSuffix}-nesting.svg`
                                    : `${type}-nesting.svg`,
                            )
                        }
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('download')}
                    </button>
                </div>
            </div>
            <div className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <ChevronsLeftRight className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium leading-none">{t('sheetWidth')}</span>
                        </div>
                        <p className="font-semibold">{nestingResult?.sheet?.w?.toFixed(2)}mm</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium leading-none">{t('sheetHeight')}</span>
                        </div>
                        <p className="font-semibold">{nestingResult?.sheet?.h?.toFixed(2)}mm</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center space-x-2">
                            <SquareDashed className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium leading-none">{t('usedHeight')}</span>
                        </div>
                        <p className="font-semibold">{nestingResult?.usedHeight?.toFixed(2)}mm</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NESTING_TYPES = ['oracal', 'plexi', 'bond'] as const;

const ElementNestingSection = ({
    el,
    index,
    item,
    t,
}: {
    el: Record<string, unknown>;
    index: number;
    item: OrderItem;
    t: ReturnType<typeof useTranslations>;
}) => {
    const elementId = el.id != null ? String(el.id) : undefined;
    const label = getElementNestingLabel(el, index, t);
    const downloadSuffix = elementId ?? `element-${index + 1}`;

    return (
        <div className="space-y-3 rounded-md border p-4">
            <p className="text-sm font-semibold">{label}</p>
            <div className="space-y-3">
                {NESTING_TYPES.map((type) => (
                    <NestingDisplay
                        key={`${elementId ?? index}-${type}`}
                        type={type}
                        item={item}
                        elementId={elementId}
                        elementIndex={elementId ? undefined : index}
                        downloadSuffix={downloadSuffix}
                    />
                ))}
            </div>
        </div>
    );
};

function FulfillmentOrderItem({
    item,
    role,
    onStatusUpdate,
    t,
    resellerKey,
    locale,
}: {
    item: OrderItem;
    role: string;
    onStatusUpdate?: (id: string, status: string) => void;
    t: ReturnType<typeof useTranslations>;
    resellerKey?: string;
    locale: string;
}) {
    const cfg = getItemConfig(item);
    const elements = getElements(cfg);
    const hasElements = elements.length > 0;
    const signSettings = getSignSettings(cfg);
    const boxSettings = isBoxConfig(cfg) ? (cfg?.boxSettings as Record<string, unknown>) : null;
    const dimensionsSource = boxSettings ?? signSettings ?? cfg;
    const mountingValue = String(signSettings?.mounting ?? cfg?.mounting ?? '');
    const mountingLabel = getCustomizationLabel(
        (item.product as Product)?.customizations,
        'mounting',
        mountingValue,
    );
    const isBoxProduct = item.product?.type != null &&
        [ProductType.boxOneFace, ProductType.boxTwoFaces, ProductType.boxBond].includes(item.product.type);
    const displayName = (cfg?.designName as string | undefined) || item.product?.name;
    const elementHasMaterials = hasElements && elements.some(hasMaterialFields);
    const materialsSource = boxSettings ?? signSettings ?? cfg;
    const showSignLevelMaterials =
        !hasElements ||
        (isBoxConfig(cfg) && hasMaterialFields(boxSettings)) ||
        (!elementHasMaterials && hasMaterialFields(materialsSource));
    const compressedConfig = typeof cfg?.config === 'string' ? cfg.config : undefined;
    const configuratorUrl = buildConfiguratorUrl({
        resellerKey: resellerKey ?? '',
        locale,
        configType: String(cfg?.configType ?? ''),
        productType: item.product?.type,
        compressedConfig,
        productId: item.product?.id,
    });

    return (
        <div className="border rounded-lg overflow-hidden mb-4">
            <div className="bg-slate-100 p-4 flex justify-between items-center gap-4">
                <div className="space-y-1">
                    <h4 className="font-semibold">{displayName} x{item.quantity}</h4>
                    <p className="text-sm text-muted-foreground">{item.product?.type}</p>
                    {configuratorUrl && (
                        <a
                            href={configuratorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {t('Orders.Item.viewInConfigurator')}
                        </a>
                    )}
                </div>
                <div className="flex justify-between gap-4 items-center">
                    <p className="text-sm">{t('Orders.Item.quote')}: <span className="font-semibold">{formatCurrency(item.price)}</span></p>
                    {role === AdminType.Manufacturer ? (
                        <div className="flex gap-2 items-center">
                            <Label>Status: </Label>
                            <Select
                                onValueChange={(value) => onStatusUpdate && onStatusUpdate(item.id, value)}
                                defaultValue={item.status}
                            >
                                <SelectTrigger className="flex-1 text-sm bg-white">
                                    <SelectValue placeholder="Please select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(OrderFulfillmentItemStatus).map((status, index) => (
                                        <SelectItem key={`status-${index}`} value={`${status}`}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <StatusBadge status={item.status} />
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border-r">
                        <h5 className="font-bold">{t('Orders.Item.content')}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {!hasElements && cfg && (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Orders.Item.signType')}</p>
                                        <p>{String(cfg.signType ?? cfg.type ?? '-')}</p>
                                    </div>
                                    {(cfg.signType ?? cfg.type) === 'text' ? (
                                        <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{t('Orders.Item.text')}</p>
                                                <p className="font-medium">{String(cfg.text ?? '')}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{t('Orders.Item.font')}</p>
                                                <p>{String(cfg.font ?? '')}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.svgData')}</p>
                                            <div
                                                className="relative h-8 w-8 hover:cursor-pointer"
                                                title="Download"
                                                onClick={() => downloadSVG(String(cfg.svgData ?? ''), String(cfg.svgName ?? 'graphic.svg'))}
                                            >
                                                <SvgImage svgString={String(cfg.svgData ?? '')} />
                                            </div>
                                            {isPresent(cfg.svgName) ? (
                                                <p className="text-xs text-muted-foreground mt-1">{String(cfg.svgName)}</p>
                                            ) : null}
                                        </div>
                                    )}
                                    {cfg.letterHeight != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.letterHeight')}</p>
                                            <p>{String(cfg.letterHeight)} cm</p>
                                        </div>
                                    )}
                                    {cfg.letterWidth != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.letterWidth')}</p>
                                            <p>{typeof cfg.letterWidth === 'number' ? cfg.letterWidth.toFixed() : '-'} cm</p>
                                        </div>
                                    )}
                                    {(cfg.signType ?? cfg.type) === 'text' && cfg.letterSpacing != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.letterSpacing')}</p>
                                            <p>{displayValue(cfg.letterSpacing)}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {hasElements && (
                                <div className="sm:col-span-2 space-y-3">
                                    {elements.map((el, idx) => (
                                        <ElementContentCard key={String(el.id ?? idx)} el={el} index={idx} t={t} />
                                    ))}
                                </div>
                            )}

                            {isBoxProduct && dimensionsSource && (
                                <>
                                    {dimensionsSource.boxHeight != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.boxHeight')}</p>
                                            <p>{displayValue(dimensionsSource.boxHeight)} cm</p>
                                        </div>
                                    )}
                                    {dimensionsSource.boxWidth != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.boxWidth')}</p>
                                            <p>{displayValue(dimensionsSource.boxWidth)} cm</p>
                                        </div>
                                    )}
                                    {dimensionsSource.boxDepth != null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.boxDepth')}</p>
                                            <p>{displayValue(dimensionsSource.boxDepth)} cm</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h5 className="font-bold">{t('Orders.Item.mountingSection')}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Orders.Item.mounting')}</p>
                                    <p>{mountingLabel}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Orders.Item.mountingColor')}</p>
                                    <p>{String(signSettings?.mountingRal ?? cfg?.mountingRal ?? '-')}</p>
                                </div>
                                {mountingValue === Mountings.CutBond ? (
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Orders.Item.mountingPadding')}</p>
                                        <p>{displayValue(signSettings?.mountingPadding ?? cfg?.mountingPadding, "0")}cm</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.mountingWidth')}</p>
                                            <p>{displayValue(signSettings?.mountingWidth ?? cfg?.mountingWidth, "0")}cm</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('Orders.Item.mountingHeight')}</p>
                                            <p>{displayValue(signSettings?.mountingHeight ?? cfg?.mountingHeight, "0")} cm</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="font-bold">{t('Orders.Item.extras')}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Orders.Item.isExterior')}</p>
                                    <p>{(signSettings?.isExterior ?? cfg?.isExterior) ? t('Orders.Item.yes') : t('Orders.Item.no')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Orders.Item.lightSensor')}</p>
                                    <p>{(signSettings?.withLightSensor ?? cfg?.withLightSensor) ? t('Orders.Item.yes') : t('Orders.Item.no')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Orders.Item.cableLength')}</p>
                                    <p>{displayValue(signSettings?.cableLength ?? cfg?.cableLength, "1")}m</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showSignLevelMaterials && (
                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                            <h5 className="font-bold">{t('Orders.Item.materials')}</h5>
                            <MaterialsGrid source={materialsSource} t={t} />
                        </div>
                    )}

                    {item?.customQuoteMessage && (
                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                            <h5 className="font-bold">{t('Orders.Item.customQuoteMessage')}</h5>
                            <p>{item.customQuoteMessage}</p>
                        </div>
                    )}

                    <div className="md:col-span-2 space-y-4 pt-4 border-t">
                        <h5 className="font-bold">{t('Manufacturers.PriceEngine.nesting')}</h5>
                        {hasElements ? (
                            elements.map((el, idx) => (
                                <ElementNestingSection
                                    key={String(el.id ?? idx)}
                                    el={el}
                                    index={idx}
                                    item={item}
                                    t={t}
                                />
                            ))
                        ) : (
                            NESTING_TYPES.map((type) => (
                                <NestingDisplay key={type} type={type} item={item} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FulfillmentItem({ fulfillment, onStatusUpdate }: {
    fulfillment: OrderFulfillment,
    onStatusUpdate?: (id: string, status: string) => void
}) {
    const { data: session } = useSession();
    const t = useTranslations();
    const locale = useLocale();
    const role = useMemo(() => (session?.user as any)?.role, [session]);
    const resellerKey = fulfillment.order?.reseller?.key;

    return (
        <div className="space-y-6">
            {role !== AdminType.Manufacturer && (
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Manufacturer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{fulfillment.manufacturer?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p>{fulfillment.manufacturer?.address}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-4">{t('Orders.Item.title')}</h3>
                {fulfillment.items.map((item: OrderItem) => (
                    <FulfillmentOrderItem
                        key={item.id}
                        item={item}
                        role={role}
                        onStatusUpdate={onStatusUpdate}
                        t={t}
                        resellerKey={resellerKey}
                        locale={locale}
                    />
                ))}
            </div>
        </div>
    );
}
