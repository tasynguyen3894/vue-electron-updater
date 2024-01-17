# vue-electron-updater

> Just a simple package to allow Electron + Vue application can play the updater smoothly

## Install

```
yarn add vue-electron-updater
```

## Usage

To use this, we need to install the function in `main` and `preload` scripts.

In the `main` script we can install the setup via the `setup` method from `ApplicationAutoUpdater` instance like this.


```js
import { BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { ApplicationAutoUpdater } from 'vue-electron-updater/main';

const applicationUpdater = new ApplicationAutoUpdater(
  autoUpdater,
  new BrowserWindow({
  }), 
  ipcMain
);
applicationUpdater.setup({
  isDev: true,
  port: 5050
});
```

In the `preload` script, we can install the setup via the function `setupPreload`.

```js
import { contextBridge, ipcRenderer } from 'electron';
import { setupPreload } from 'vue-electron-updater/preload';

setupPreload(contextBridge, ipcRenderer);
```

In Vue, we need to install the plugin:

```js
import { createApplicationUpdater } from 'vue-electron-updater/vue';

app.use(createApplicationUpdater());
```

app.use()
```

## License

MIT &copy; [Sang Nguyen](https://github.com/tasynguyen3894)
