import * as axios from 'axios';
import { Homey } from 'homey';
import { IConnection } from '../models/IConnection.model';
import { IDeviceCapabilityValue } from '../models/IDeviceCapabilityValue.model';

export class UploadValueService {
    connection: IConnection;

    constructor(private homey: Homey) {
        this.homey.settings.on('set', (name) => {
            if (name === 'connection') {
                this.getConnection();
            }
        });
        this.getConnection();
    }

    async getConnection() {
        this.connection = await this.homey.settings.get('connection');
    }

    async uploadValues(values: IDeviceCapabilityValue[]) {
        return axios.default.post(`${this.connection.baseUrl}/${this.connection.valueEndpoint}`, values, {
            headers: {
                'x-api-key': this.connection.apiKey,
            },
        });
    }
}
