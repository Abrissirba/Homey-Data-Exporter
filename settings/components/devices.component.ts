import { ICapability } from './../../models/ICapability.model';
import { IDevice } from './../../models/IDevice.model';
import { LitElement, html, property, customElement, css } from 'lit-element';
import { IConnection } from '../../models/IConnection.model';
import { fiedset, h1, input, global } from '../styles/styles';
import { repeat } from 'lit-html/directives/repeat';

@customElement('app-devices')
export class DevicesComponent extends LitElement {
    @property() devices: IDevice[];

    static get styles() {
        return [
            global,
            h1,
            fiedset,
            input,
            css`
                input[type='checkbox'] {
                    margin-right: 8px;
                }
            `,
        ];
    }

    constructor() {
        super();
    }

    onChange(checked: boolean, capability: ICapability) {
        capability.isActivatedForSync = checked;
    }

    render() {
        return html`
            <h1>Devices</h1>
            ${repeat(
                this.devices,
                (device) => device.id,
                (device, index) => html`
                    <fieldset>
                        <legend>${device.name}</legend>
                        ${repeat(
                            device.capabilities,
                            (capability) => capability.id,
                            (capability) => html`
                                <div class="field row">
                                    <input
                                        id="${device.id + '::' + capability.id}"
                                        type="checkbox"
                                        .checked="${capability.isActivatedForSync}"
                                        @change="${(evt: any) => this.onChange(evt.target.checked, capability)}"
                                    />
                                    <label for="${device.id + '::' + capability.id}">${capability.title}</label>
                                </div>
                            `,
                        )}
                    </fieldset>
                `,
            )}
        `;
    }
}
