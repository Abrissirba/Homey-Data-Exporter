import { IZoneMap } from '../app';
import { IDeviceLabel } from '../models/IZoneLabels.model';

export function getZoneLabels(zoneId: string, zones: IZoneMap): IDeviceLabel {
    let zone = zones[zoneId];
    if (!zone) {
        return {};
    }
    if (!zone.parent) {
        let ret = {} as any;
        ret.home = ret.zone = ret.zones = zone.name;
        return ret;
    } else {
        let ret = getZoneLabels(zone.parent, zones);
        ret.zone = zone.name;
        ret.zones += '/' + ret.zone.replace('/', ' ');
        return ret;
    }
}
