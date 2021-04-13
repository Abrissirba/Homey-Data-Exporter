import { HomeyAPI } from 'athom-api';
import { App } from 'homey';
import { ICapability } from './models/ICapability.model';
import { IDevice } from './models/IDevice.model';
import { IDeviceCapabilityValue } from './models/IDeviceCapabilityValue.model';
import { StorageService } from './services/storage.service';
import { UploadValueService } from './services/upload.service';
import { getZoneLabels } from './utils/zone-helper';
('use strict');

type Device = HomeyAPI.ManagerDevices.Device;
type Capability = HomeyAPI.ManagerDevices.Capability;

export interface IZoneMap {
    [key: string]: HomeyAPI.ManagerZones.Zone;
}

// Add inspector
if (process.env.DEBUG === '1') {
    const inspector = require('inspector');
    inspector.open(9229, '0.0.0.0', false);
    // inspector.waitForDebugger();
    //require(“inspector”).open(9229, “0.0.0.0”, true);
}

class MyApp extends App {
    private deviceListNeedsUpdate = false;
    private device_labels: any = {};
    private deviceCapabilityInstances: { [deviceId: string]: HomeyAPI.ManagerDevices.Device.CapabilityInstance[] } = {};
    private _api: HomeyAPI = null;
    private deviceCapabilitiesToSync: IDevice[];
    private uploadValueService: UploadValueService;
    private storageService: StorageService;
    private syncIsInProgress = false;
    private lastSentNotificationDate: Date = null;

    private syncInterval = 5 * 60 * 1000;
    private sendNotificationWhenValuesExceeds = 2000;
    private sendNotificationInterval = 8 * 60 * 60 * 1000;

    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        await this.initDeviceCapabilitiesToSyncSettings();
        this.uploadValueService = new UploadValueService(this.homey);
        this.storageService = new StorageService();
        this.initUploadLocalValuesSync();
        await this.initDeviceList();
    }

    async initDeviceCapabilitiesToSyncSettings() {
        this.homey.settings.on('set', async (name) => {
            if (name === 'deviceCapabilitiesToSync') {
                this.deviceCapabilitiesToSync = (await this.homey.settings.get('deviceCapabilitiesToSync')) || [];
            }
        });
        this.deviceCapabilitiesToSync = (await this.homey.settings.get('deviceCapabilitiesToSync')) || [];
    }

    async initDeviceList() {
        const api = await this.getApi();
        this.deviceListNeedsUpdate = true;
        await this.updateDeviceList();
        const apiDevices = api.devices as any;
        apiDevices.setMaxListeners(100);
        apiDevices.on('device.create', (device: Device) => {
            console.log('Adding new device ' + device.id + ' with name ' + device.name + ' driver ' + device.driverId);
            this.deviceListNeedsUpdate = true;
            setTimeout(this.updateDeviceList.bind(this), 1000);
        });
        apiDevices.on('device.update', (device: Device) => {
            console.log('Updating device ' + device.id + ' with name ' + device.name + ' driver ' + device.driverId);
            this.deviceListNeedsUpdate = true;
            setTimeout(this.updateDeviceList.bind(this), 10000);
        });
        apiDevices.on('device.delete', (device: Device) => {
            console.log('Deleting device ' + device.id + ' with name ' + device.name + ' driver ' + device.driverId);
            this.deviceListNeedsUpdate = true;
            setTimeout(this.updateDeviceList.bind(this), 1000);
        });
    }

    async getApi() {
        if (!this._api) {
            this._api = await HomeyAPI.forCurrentHomey(this.homey);
        }
        return this._api;
    }

    async updateDeviceList() {
        if (this.deviceListNeedsUpdate) {
            this.deviceListNeedsUpdate = false;
            this.log('Update device list');
            const api = await this.getApi();
            const zones = await api.zones.getZones();
            const devices = await api.devices.getDevices();

            this.unsubscribeDevices();

            this.deviceCapabilityInstances = {};
            for (let deviceId in devices) {
                this.registerDevice(deviceId, devices[deviceId], zones);
            }
            this.updateDevicesForSettingsView(devices);
        }
    }

    // saves a list of all devices and their capabilities to storage.
    // This list is used in the settings app to set which capabilties that should be synced
    updateDevicesForSettingsView(devices: { [key: string]: HomeyAPI.ManagerDevices.Device }) {
        const deviceSettings: IDevice[] = [];
        for (let deviceId in devices) {
            const device = devices[deviceId];
            let deviceCapabilities: ICapability[] = [];
            for (let deviceCapabilityId in device.capabilitiesObj) {
                const deviceCapability: Capability = device.capabilitiesObj[deviceCapabilityId] as any;
                deviceCapabilities.push({
                    id: deviceCapability.id,
                    decimals: deviceCapability.decimals,
                    units: deviceCapability.units,
                    title: deviceCapability.title,
                    type: deviceCapability.type,
                    lastUpdated: (deviceCapability as any).lastUpdated,
                });
            }

            deviceSettings.push({
                id: device.id,
                name: device.name,
                zone: device.zone,
                capabilities: deviceCapabilities,
            });
        }
        this.homey.settings.set('devices', deviceSettings);
    }

    registerDevice(deviceId: string, device: Device, zones: IZoneMap) {
        const labels = getZoneLabels(device.zone, zones);
        labels.deviceId = deviceId;
        labels.deviceName = device.name;

        if (!this.device_labels[deviceId]) {
            // Report initial state
            this.device_labels[deviceId] = labels; // Need to do this before reportState
            const capabiltyInstances = [];
            for (let capability of device.capabilities) {
                const capabilitiesObj: Capability =
                    device.capabilitiesObj && (device.capabilitiesObj[capability] as any);
                const capId = capabilitiesObj?.id;
                if (!!capId) {
                    (device as any).setMaxListeners(1000); // Silence incorrect memory leak warning if we listen to many devices
                    const capInst = device.makeCapabilityInstance(capId, (val) =>
                        this.onDeviceNewValue(device, capability, val),
                    );
                    capabiltyInstances.push(capInst);
                }
            }
            this.deviceCapabilityInstances[deviceId] = capabiltyInstances; // Register so that we can dispose when device renamed/moved
        } else {
            this.device_labels[deviceId] = labels; // Update labels in case device was renamed/moved
        }
    }

    onDeviceNewValue(device: Device, capabilityId: string, value: any) {
        console.log(`New value ${device.name} (${device.id}), ${capabilityId}: ${value}`);
        this.reportState(device.id, capabilityId, value);
    }

    reportState(deviceId: string, capabilityId: string, value: any) {
        const capabilityToSync = this.deviceCapabilitiesToSync
            .find((x) => x.id === deviceId)
            ?.capabilities.find((x) => x.id === capabilityId);

        if (capabilityToSync) {
            // Convert type
            if (typeof value === 'boolean') {
                value = value ? 1 : 0;
            } else if (typeof value === 'string') {
                return; // Strings are not yet mapped
            }

            const deviceCapabilityValue: IDeviceCapabilityValue = {
                capabilityId,
                deviceId,
                value,
                timestamp: new Date(),
            };
            // this.storageService.addValue(deviceCapabilityValue);
            this.uploadValueService.uploadValues([deviceCapabilityValue]).catch((err) => {
                this.error('Could not upload value', deviceCapabilityValue, err);
                this.storageService.addValue(deviceCapabilityValue);
            });
        }
    }

    private unsubscribeDevices() {
        this.device_labels = {};
        for (let deviceId in this.deviceCapabilityInstances) {
            for (let capInst of this.deviceCapabilityInstances[deviceId]) {
                capInst.destroy();
            }
        }
    }

    // runs in an intervall and checks if their are any values that could not be sent
    // if there are any values, these are sent to the api
    private initUploadLocalValuesSync() {
        setInterval(async () => {
            this.log('Start sync, syncIsInProgress: ', this.syncIsInProgress);
            if (this.syncIsInProgress === false) {
                this.syncIsInProgress = true;
                let nrOfItems = null;
                try {
                    const from = new Date();
                    const values = await this.storageService.getValues(from);
                    nrOfItems = values.length;
                    if (values.length > 0) {
                        const res = await this.uploadValueService.uploadValues(values);
                        if (res.status === 200) {
                            await this.storageService.deleteValues(from);
                        } else {
                            await this.createFailedUploadNotification(nrOfItems);
                        }
                    }
                    this.syncIsInProgress = false;
                } catch (err) {
                    this.error(err);
                    this.syncIsInProgress = false;
                    await this.createFailedUploadNotification(nrOfItems);
                }
            }
        }, this.syncInterval);
    }

    async createFailedUploadNotification(nrOfItems: number) {
        if (nrOfItems > this.sendNotificationWhenValuesExceeds) {
            let diff = null;
            if (this.lastSentNotificationDate != null) {
                diff = new Date().getTime() - this.lastSentNotificationDate.getTime();
            }
            if (diff === null || diff > this.sendNotificationInterval) {
                await this.homey.notifications.createNotification({
                    excerpt: `DataExport: Failed to upload to web api. There are ${nrOfItems} values waiting to be uploaded `,
                });
                this.lastSentNotificationDate = new Date();
            }
        }
    }
}

module.exports = MyApp;
