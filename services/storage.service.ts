import { IDeviceCapabilityValue } from './../models/IDeviceCapabilityValue.model';
import Datastore from 'nedb';

export class StorageService {
    db: Datastore;

    constructor() {
        this.db = new Datastore<IDeviceCapabilityValue>({
            filename: '/userdata/deviceCapabilityValues.db',
            autoload: true,
        });
    }

    addValue(value: IDeviceCapabilityValue) {
        this.db.insert(value);
    }

    getValues(from: Date) {
        return new Promise<IDeviceCapabilityValue[]>((resolve, reject) => {
            this.db.find({ timestamp: { $lte: from } }, (err: any, values: IDeviceCapabilityValue[]) => {
                if (err) {
                    reject(err);
                }
                resolve(values);
            });
        });
    }

    deleteValues(from: Date) {
        return new Promise((resolve, reject) => {
            this.db.remove({ timestamp: { $lte: from } }, { multi: true }, (err: any, numRemoved) => {
                console.log('DELETE', err, numRemoved);
                if (err) {
                    reject(err);
                }
                resolve(numRemoved);
            });
        });
    }
}
