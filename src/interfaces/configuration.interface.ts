export interface Configuration {
    id?: string,
    name: string,
    signType: 'text'|'svg',
    text?: string,
    font: string,
    svgData?: string,
    letterHeight: number,
    letterWidth: number,
    letterDepth: number,
    letterSpacing: number,
    boxWidth: number,
    boxHeight: number,
    boxDepth: number,
    isSingleColor: boolean,
    faceMaterial: string,
    sideMaterial: string,
    extraMaterial: string,
    ledMaterial: string,
    rgbColor: string,
    mounting: string,
    mountingColor: string,
    mountingRal: string,
    mountingPadding: number,
    mountingWidth: number,
    mountingHeight: number,
    isExterior: boolean,
    withLightSensor: boolean,
    cableLength: number,
    resellerKey: string,
    userId: string,
    productId: string,
}

export interface UserConfiguration {
    name: string;

    resellerKey: string;

    user: string;

    product: string;
}

export interface OrderItemConfiguration extends Configuration {}