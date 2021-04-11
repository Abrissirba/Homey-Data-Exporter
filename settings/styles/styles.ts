import { css } from 'lit-element';

export const global = css`
    @import url(../font/roboto/roboto.css);
    @import url(../font/fontawesome/fontawesome.css);
    * {
        margin: 0;
        padding: 0;
        outline: 0;
        -webkit-user-select: auto !important;
        -webkit-user-drag: none;
    }
`;
export const h1 = css`
    h1 {
        font-size: 1.3em;
        font-weight: 400;
        margin-bottom: 1em;
    }
`;

export const h2 = css`
    h2 {
        font-size: 1em;
        font-weight: 400;
        margin-bottom: 0.2em;
    }
`;

export const h3 = css`
    h3 {
        font-size: 0.9em;
        font-weight: 400;
    }
`;

export const fiedset = css`
    fieldset:not(.hy-nostyle),
    .hy-fieldset {
        border: 1px solid #eee;
        border-radius: 5px;
        padding: 0.75em;
        margin-bottom: 1em;
    }

    fieldset legend,
    .hy-fieldset:not(.hy-nostyle) legend {
        padding: 0 0.5em;
        text-transform: uppercase;
        color: #616161;
        font-size: 10px;
        font-weight: 400;
    }
`;

export const input = css`
    .field {
        margin: 4px 0;
    }

    label:not(.hy-nostyle),
    .hy-label {
        text-transform: uppercase;
        color: #616161;
        font-size: 10px;
        font-weight: 400;
    }

    input[type='text']:not(.hy-nostyle),
    input[type='password']:not(.hy-nostyle),
    input[type='email']:not(.hy-nostyle),
    .hy-input-text {
        width: 100%;
        border: 0;
        border-bottom: 1px solid #eaeaea;
        font-size: 16px;
        font-weight: 400;
        color: black;
        padding: 3px 0 9px 0;
    }

    input[type='text']:not(.hy-nostyle)::-webkit-input-placeholder,
    input[type='password']:not(.hy-nostyle)::-webkit-input-placeholder,
    input[type='email']:not(.hy-nostyle)::-webkit-input-placeholder,
    .hy-input-text::-webkit-input-placeholder {
        font-weight: 100;
        color: #aaa;
    }

    input[type='checkbox']:not(.hy-nostyle),
    .hy-input-checkbox {
        -webkit-appearance: none;
        width: 1em;
        height: 1em;
        border: 0;
        background-color: transparent;
        background-image: url(styles/check.png);
        background-position: center center;
        background-repeat: no-repeat;
        background-size: contain;
        -webkit-filter: grayscale(100%);
        opacity: 0.2;
        vertical-align: middle;
    }

    input[type='checkbox']:not(.hy-nostyle):checked,
    .hy-input-checkbox:checked {
        -webkit-filter: grayscale(0);
        opacity: 1;
    }
`;

export const buttons = css`
    .button,
    .hy-button,
    input[type='button']:not(.hy-nostyle),
    button:not(.hy-nostyle) {
        -webkit-appearance: none;
        background-color: #e7e7e7;
        border: 0;
        border-radius: 3px;
        margin-right: 1px;
        margin-bottom: 1px;
        padding: 6px 16px;
        font-size: 1em;
        font-weight: 400;
        color: #555;
        height: auto !important;
        flex-shrink: 0;
    }

    .hy-button-primary:not(.hy-nostyle) {
        background-color: #00c139;
        color: white;
    }

    .hy-button-fill:not(.hy-nostyle) {
        width: 100%;
        height: 48px;
        text-align: center;
        margin-right: 0;
    }
`;
