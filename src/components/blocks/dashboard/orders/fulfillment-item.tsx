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
import { ExternalLink, Loader2 } from "lucide-react";
import { OrderItemMeasurementsBlock } from "@/components/blocks/dashboard/orders/measurements-section";

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
            {isPresent(source.sideMaterial) && source.isSingleColor === false ? (
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

                    <div className="md:col-span-2 pt-4 border-t">
                        <OrderItemMeasurementsBlock
                            item={item}
                            hasElements={hasElements}
                            elements={elements}
                            t={t}
                        />
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
