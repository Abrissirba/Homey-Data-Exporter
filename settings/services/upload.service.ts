import { IDevice } from './../../models/IDevice.model';
import { IConnection } from './../../models/IConnection.model';

export class UploadService {
    connection: IConnection;

    constructor(private homey: any) {
        this.homey.on('settings.set', (name) => {
            if (name === 'connection') {
                this.getConnection();
            }
        });
        this.getConnection();
    }

    async getConnection() {
        this.connection = await this.homey.get('connection');
    }

    async uploadDevices(devices: IDevice[]) {
        return fetch(this.connection.baseUrl + '/' + this.connection.deviceEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.connection.apiKey,
            },
            body: JSON.stringify(devices),
        });
    }
}
