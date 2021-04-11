import { LitElement, html, property, customElement } from 'lit-element';
import { IConnection } from '../../models/IConnection.model';
import { fiedset, h1, input, global } from '../styles/styles';

@customElement('app-connection')
export class ConnectionComponent extends LitElement {
    @property() connection: IConnection;

    static get styles() {
        return [global, h1, fiedset, input];
    }

    constructor() {
        super();
    }

    onInputChange(evt: any) {
        (this.connection as any)[evt.target.id] = evt.target.value;
    }

    render() {
        return html`
            <h1>Connection</h1>
            <fieldset>
                <div class="field row">
                    <label class="form_label" for="baseUrl">Base url</label>
                    <input
                        class="form_input"
                        id="baseUrl"
                        type="text"
                        .value="${this.connection?.baseUrl || ''}"
                        @change=${this.onInputChange}
                    />
                </div>
                <div class="field row">
                    <label class="form_label" for="deviceEndpoint">Devices endpoint</label>
                    <input
                        class="form_input"
                        id="deviceEndpoint"
                        type="text"
                        .value="${this.connection?.deviceEndpoint || ''}"
                        @change=${this.onInputChange}
                    />
                </div>
                <div class="field row">
                    <label class="form_label" for="valueEndpoint">Values endpoint</label>
                    <input
                        class="form_input"
                        id="valueEndpoint"
                        type="text"
                        .value="${this.connection?.valueEndpoint || ''}"
                        @change=${this.onInputChange}
                    />
                </div>
                <div class="field row">
                    <label class="form_label" for="apiKey">Api key</label>
                    <input
                        class="form_input"
                        id="apiKey"
                        type="text"
                        .value="${this.connection?.apiKey || ''}"
                        @change=${this.onInputChange}
                    />
                </div>
            </fieldset>
        `;
    }
}
