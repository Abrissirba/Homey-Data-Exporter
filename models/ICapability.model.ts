export interface ICapability {
    id: string;
    decimals: number;
    units: string;
    title: string;
    type: string;
    lastUpdated: Date | string;
    isActivatedForSync?: boolean;
}
