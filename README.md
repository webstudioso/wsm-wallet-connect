 # Webstudio Wallet Connect Module

This module adds EVM authentication capabilities to web apps built with [Webstudio](https://webstudio.so)

 ![Webstudio Module Wallet Connect](https://github.com/webstudioso/wsm-wallet-connect/actions/workflows/production.yml/badge.svg)

### Testing and Building Module
```
npm i
npm run test
npm run build
```

### Publish to NPMJS
```
npm publish
```

### Importing Dependency in Webstudio
Add it to the project, this is compatible with `grapesjs` as well.
```shell
npm i --save wsm-wallet-connect@latest
```
To import in the editor add the file and include it as a Plugin
```js
import PluginWalletConnect from "wsm-wallet-connect"

const editor = grapesjs.init({
    container: "#gjs",
    plugins: [
        PluginWalletConnect
    ],
})
```