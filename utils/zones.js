export function getZoneLabels(zoneId, zones) {
  let zone = zones[zoneId];
  if (!zone) return {};
  if (!zone.parent) {
    let ret = {};
    ret.home = ret.zone = ret.zones = zone.name;
    return ret;
  } else {
    let ret = getZoneLabels(zone.parent, zones);
    ret.zone = zone.name;
    ret.zones += "/" + ret.zone.replace("/", " ");
    return ret;
  }
}
