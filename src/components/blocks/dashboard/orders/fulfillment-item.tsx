import { Customization, CustomizationOption, Product, ProductType } from "@/interfaces/product.interface";
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
import { useTranslations } from "next-intl";
import { Mountings } from "@/lib/const";
import { routes } from "@/lib/fetcher";
import { useFetcher } from "@/hooks/use-fetcher";
import { ChevronsLeftRight, ChevronsLeftRightEllipsis, ChevronsUpDown, Loader2, SquareDashed } from "lucide-react";

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


const MaterialDisplay = ({ materialId }: { materialId: string }) => {
    const { data: session } = useSession();
    const { data: material, isLoading } = useFetcher({
        route: `${routes.material}/${materialId}`,
        token: (session as any)?.accessToken,
        queryParams: ""
    });

    return <span>{isLoading ? <Loader2 className="animate-spin" /> : (material?.productAlias ?? '-')}</span>
}

const NestingDisplay = ({ type, item }: { type: string, item: OrderItem | undefined }) => {
    const t = useTranslations('Manufacturers.PriceEngine');
    const { data: session } = useSession();
    const usesType = item?.product?.priceFormula?.includes(`${type}NestingResult`)

    const { data: nestingResult, isLoading } = useFetcher({
        route: usesType ? `${routes.priceEngine}/nesting` : undefined,
        token: (session as any)?.accessToken,
        queryParams: {
            orderItemId: item?.id,
            type
        }
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
                         onClick={() => downloadSVG(nestingResult.preview, `${type}-nesting.svg`)}
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

export function FulfillmentItem({ fulfillment, onStatusUpdate }: {
    fulfillment: OrderFulfillment,
    onStatusUpdate?: (id: string, status: string) => void
}) {
    const { data: session } = useSession();
    const t = useTranslations();
    const role = useMemo(() => (session?.user as any)?.role, [session]);

    return (
        <div className="space-y-6">
            {role !== AdminType.Manufacturer && <div className="bg-slate-50 p-4 rounded-lg">
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
            </div>}


            {/* Items */}
            <div>
                <h3 className="text-lg font-semibold mb-4">{t('Orders.Item.title')}</h3>
                {fulfillment.items.map((item: OrderItem, index: number) => (
                    <div key={index} className="border rounded-lg overflow-hidden mb-4">
                        {/* Product Header */}
                        <div className="bg-slate-100 p-4 flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold">{item.product?.name} x{item.quantity}</h4>
                                <p className="text-sm text-muted-foreground">{item.product?.type}</p>
                            </div>
                            <div className="flex justify-between gap-4 items-center">
                                <p className="text-sm">{t('Orders.Item.quote')}: <span
                                    className="font-semibold">${item.price}</span></p>
                                {role === AdminType.Manufacturer ? <div className="flex gap-2 items-center">
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
                                                <SelectItem key={`status-${index}`}
                                                    value={`${status}`}>{status}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div> : <StatusBadge status={item.status} />}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-4 border-r">
                                    <h5 className="font-bold">Content</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Sign Type</p>
                                            <p>{item.configuration.signType}</p>
                                        </div>
                                        {item.configuration.signType === 'text' ? <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Text</p>
                                                <p className="font-medium">{item.configuration.text}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Font</p>
                                                <p>{item.configuration.font}</p>
                                            </div>
                                        </> :
                                            <div className="">
                                                <p className="text-sm text-muted-foreground">Svg Data</p>
                                                <div className="relative h-8 w-8 hover:cursor-pointer" title='Download'
                                                    onClick={() => downloadSVG(item.configuration.svgData ?? '')}>
                                                    <SvgImage svgString={item.configuration.svgData ?? ''} />
                                                </div>
                                            </div>}

                                        <div>
                                            <p className="text-sm text-muted-foreground">Letter Height</p>
                                            <p>{item.configuration.letterHeight} cm</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Letter Width</p>
                                            <p>{item.configuration.letterWidth?.toFixed() ?? '0'} cm</p>
                                        </div>
                                        {item.configuration.signType === 'text' && <div>
                                            <p className="text-sm text-muted-foreground">Letter Spacing</p>
                                            <p>{item.configuration.letterSpacing}</p>
                                        </div>}
                                        {
                                            item.product?.type && [ProductType.boxOneFace, ProductType.boxTwoFaces, ProductType.boxBond].includes(item.product?.type) && <>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Box Height</p>
                                                    <p>{item.configuration.boxHeight} cm</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Box Width</p>
                                                    <p>{item.configuration.boxWidth} cm</p>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold">Extras</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Mounting</p>
                                            <p>{t(`Products.Customization.mounting.options.${item.configuration.mounting}`)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Mounting Color</p>
                                            <p>{item.configuration.mountingRal}</p>
                                        </div>
                                        {item.configuration.mounting === Mountings.CutBond ?
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mounting Padding</p>
                                                <p>{item.configuration.mountingPadding}cm</p>
                                            </div>
                                            : <>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Mounting Width</p>
                                                    <p>{item.configuration.mountingWidth}cm</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Mounting Height</p>
                                                    <p>{item.configuration.mountingHeight} cm</p>
                                                </div>
                                            </>
                                        }
                                        <div>
                                            <p className="text-sm text-muted-foreground">Is Exterior</p>
                                            <p>{item.configuration.isExterior ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Light Sensor</p>
                                            <p>{item.configuration.withLightSensor ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Cable Length</p>
                                            <p>{item.configuration.cableLength}m</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                    <h5 className="font-bold">Materials</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Face Color</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MaterialDisplay materialId={item.configuration.faceMaterial} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Side Color</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MaterialDisplay materialId={item.configuration.sideMaterial} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Extra Color</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MaterialDisplay materialId={item.configuration.extraMaterial} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">LED Color</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MaterialDisplay materialId={item.configuration.ledMaterial} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {item?.customQuoteMessage &&
                                    <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                        <h5 className="font-bold">{t('Orders.Item.customQuoteMessage')}</h5>
                                        <p>{item.customQuoteMessage}</p>
                                    </div>
                                }

                                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                    <h5 className="font-bold">{t('Manufacturers.PriceEngine.nesting')}</h5>
                                    <NestingDisplay type="oracal" item={item} />
                                    <NestingDisplay type="plexi" item={item} />
                                    <NestingDisplay type="bond" item={item} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}