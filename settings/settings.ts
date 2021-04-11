import { css, customElement, html, LitElement, property } from 'lit-element';
import { IConnection } from './../models/IConnection.model';
import { IDevice } from './../models/IDevice.model';
import './components/connection.component';
import './components/devices.component';
import { UploadService } from './services/upload.service';
import { buttons } from './styles/styles';
declare var Homey: any;

@customElement('settings-app')
export class SettingsApp extends LitElement {
    @property() connection: IConnection;
    @property() devices: IDevice[] = [];
    @property() deviceCapabilitiesToSync: IDevice[];

    homey: any;
    uploadService: UploadService;

    static get styles() {
        return [
            buttons,
            css`
                .container {
                    height: calc(100vh - 45px);
                    overflow: auto;
                }

                .button-container {
                    padding: 8px;
                }

                button {
                    width: 100%;
                }
            `,
        ];
    }

    constructor() {
        super();

        (window as any).onHomeyReady = (homey: any) => {
            this.homey = homey;
            this.init();
        };
    }

    async init() {
        this.uploadService = new UploadService(this.homey);
        this.devices = await this.homey.get('devices');
        this.deviceCapabilitiesToSync = (await this.homey.get('deviceCapabilitiesToSync')) || [];
        this.connection = (await Homey.get('connection')) || {};

        this.devices = this.devices.filter((x) => x.capabilities.length > 0);
        this.devices.forEach((device) => {
            const syncedDevice = this.deviceCapabilitiesToSync.find((x) => x.id === device.id);
            if (syncedDevice) {
                syncedDevice.capabilities.forEach((x) => {
                    const capability = device.capabilities.find((y) => y.id === x.id);
                    if (capability) {
                        capability.isActivatedForSync = x.isActivatedForSync;
                    }
                });
            }
        });
        this.homey.ready();
    }

    async onSave() {
        const deviceCapabilitiesToSync: IDevice[] = [];

        this.devices.forEach((device) => {
            const capabiltiesToSync = device.capabilities.filter((x) => x.isActivatedForSync === true);
            if (capabiltiesToSync.length > 0) {
                deviceCapabilitiesToSync.push({
                    ...device,
                    capabilities: capabiltiesToSync,
                });
            }
        });
        this.deviceCapabilitiesToSync = deviceCapabilitiesToSync;
        try {
            const response = await this.uploadService.uploadDevices(deviceCapabilitiesToSync);
        } catch (err) {
            this.homey.alert('Could not upload device capabilities ' + JSON.stringify(err), 'error');
        }

        this.homey.set('connection', this.connection);
        this.homey.set('deviceCapabilitiesToSync', this.deviceCapabilitiesToSync);
    }

    render() {
        return html`<div class="container">
                <app-connection .connection="${this.connection}"></app-connection>
                <app-devices .devices="${this.devices}"></app-devices>
            </div>
            <div class="button-container">
                <button class="hy-button-primary" @click="${this.onSave}">Save</button>
            </div> `;
    }
}
