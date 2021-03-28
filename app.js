"use strict";

const Homey = require("homey");
const { HomeyAPI } = require("athom-api");

if (process.env.DEBUG === "1") {
  const inspector = require("inspector");
  inspector.open(9229, "0.0.0.0", false);
  inspector.waitForDebugger();
  //require(“inspector”).open(9229, “0.0.0.0”, true);
}

class MyApp extends Homey.App {
  deviceListNeedsUpdate = false;
  device_labels = {};
  device_cap_insts = {};
  zwave_devices = {};
  zigbee_devices = {};
  online_devices = {};

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log("MyApp has been initialized");
    let api = await this.getApi();

    this.deviceListNeedsUpdate = true;
    await this.updateDeviceList();
    api.devices.on("device.create", (dev) => {
      console.log(
        "Adding new device " +
          dev.id +
          " with name " +
          dev.name +
          " driver " +
          dev.driverId
      );
      deviceListNeedsUpdate = true;
      setTimeout(this.updateDeviceList.bind(this), 1000);
    });
    api.devices.on("device.update", (dev) => {
      console.log(
        "Updating device " +
          dev.id +
          " with name " +
          dev.name +
          " driver " +
          dev.driverId
      );
      deviceListNeedsUpdate = true;
      setTimeout(this.updateDeviceList.bind(this), 10000);
    });
    api.devices.on("device.delete", (dev) => {
      console.log(
        "Deleting device " +
          dev.id +
          " with name " +
          dev.name +
          " driver " +
          dev.driverId
      );
      deviceListNeedsUpdate = true;
      setTimeout(this.updateDeviceList.bind(this), 1000);
    });
  }

  async getApi() {
    if (!this.api) {
      this.api = await HomeyAPI.forCurrentHomey(this.homey);
    }
    return this.api;
  }

  async getDevices() {
    const api = await this.getApi();
    let allDevices = await api.devices.getDevices();
    return allDevices;
  }

  async updateDeviceList() {
    if (!this.deviceListNeedsUpdate) return;
    this.deviceListNeedsUpdate = false;
    this.log("Update device list");
    let api = await this.getApi();
    let zones = await api.zones.getZones();
    let devices = await api.devices.getDevices();

    this.device_labels = {};
    // for(let key in gauge_device) {
    //     gauge_device[key].reset();
    // }
    // for(let devId in device_cap_insts) {
    //     for(let capInst of device_cap_insts[devId]) {
    //         capInst.destroy();
    //     }
    // }

    this.device_cap_insts = {};
    for (let devId in devices) {
      this.registerDevice(devId, devices[devId], zones);
    }
  }

  registerDevice(devId, dev, zones) {
    console.log("Registering device " + devId);
    var labels = getZoneLabels(dev.zone, zones);
    labels.device = devId;
    labels.name = dev.name;
    if (!(devId in this.device_labels)) {
      // Report initial state
      this.device_labels[devId] = labels; // Need to do this before reportState
      let s = dev.capabilities;
      let capInsts = [];
      for (let sn of s) {
        if (!dev.capabilitiesObj) continue;
        if (!dev.capabilitiesObj[sn]) continue;
        let capId = dev.capabilitiesObj[sn].id;
        if (!capId) continue;
        var capInst = null;
        let self = this;
        function onCapChg(val) {
          if (val !== null && val !== undefined) {
            console.log(" dev cap " + dev.name + " " + sn + " is " + val);
            self.reportState(devId, sn, val);
          }
        }
        dev.setMaxListeners(1000); // Silence incorrect memory leak warning if we listen to many devices
        capInst = dev.makeCapabilityInstance(capId, onCapChg);
        // Report initial state
        capInsts.push(capInst);
        onCapChg(capInst.value);
      }
      this.device_cap_insts[devId] = capInsts; // Register so that we can dispose when device renamed/moved
    } else {
      this.device_labels[devId] = labels; // Update labels in case device was renamed/moved
    }
    if (dev.flags.includes("zwave")) {
      let zwaveId = dev.settings.zw_node_id;
      if (zwaveId) {
        console.log("Device " + dev.name + " has Z-Wave node id " + zwaveId);
        this.zwave_devices[zwaveId] = devId;
      }
    }
    if (dev.flags.includes("zigbee")) {
      let zigbeeId = dev.settings.zb_device_id;
      if (zigbeeId) {
        console.log("Device " + dev.name + " has ZigBee device id " + zigbeeId);
        this.zigbee_devices[zigbeeId] = devId;
      }
    }
  }

  reportState(devId, statename, value) {
    if (value === null || value === undefined) return;

    // Convert type
    if (typeof value === "boolean") value = value ? 1 : 0;
    else if (typeof value === "string") return; // Strings are not yet mapped

    // Make sure state names are valid (e.g. remove dots in names)
    statename = statename.replace(/[^A-Za-z0-9_]/g, "_");

    //console.log("State changed for " + devId + ", " + statename);
    let key = "homey_device_" + statename;
    // if(!(key in gauge_device)) {
    //     gauge_device[key] = new client.Gauge({ name: 'homey_device_' + statename, help: 'State ' + statename, labelNames: ['device', 'name', 'zone', 'zones'] });
    // }
    // let labels = device_labels[devId]
    // if(!labels) {
    //     console.log("Cannot report unknown device " + devId);
    // } else {
    //     gauge_device[key].labels(labels.device, labels.name, labels.zone, labels.zones).set(value);
    // }
  }
}

module.exports = MyApp;

function getZoneLabels(zoneId, zones) {
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
