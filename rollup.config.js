// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
const fs = require('fs');
export default {
    input: 'settings/settings.ts',
    output: {
        dir: 'settings/dist',
        format: 'cjs',
        sourcemap: true,
    },
    plugins: [
        nodeResolve(),
        typescript({
            tsconfig: 'settings/tsconfig.json',
        }),
        serve({
            contentBase: 'settings',
            https: {
                key: fs.readFileSync('./security/cert.key'),
                cert: fs.readFileSync('./security/cert.crt'),
                ca: fs.readFileSync('./security/cert.cer'),
            },
        }),
    ],
};

// openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout example.key -out example.crt -subj "//CN=example.com" -addext "subjectAltName=DNS:example.com,DNS:www.example.net,IP:192.168.1.158"
