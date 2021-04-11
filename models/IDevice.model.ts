import { ICapability } from './ICapability.model';

export interface IDevice {
    id: string;
    name: string;
    zone: string;
    capabilities: ICapability[];
}
