import { BrowserWindow, IpcMain } from 'electron';
import { AppUpdater } from 'electron-updater';

import { createDispatcher, Dispatcher } from './dispatcher';
import { createUpdater } from './updater';
import { EVENT_INVOKE_KEY, HandlerType } from './constant';
import { UpdaterDevServer } from './apiH3';

export class ApplicationAutoUpdater {
  protected autoUpdater: AppUpdater;
  protected appWindow: BrowserWindow;
  protected ipcMain: IpcMain;
  protected dispatcher: Dispatcher;

  constructor(autoUpdater: AppUpdater, appWindow: BrowserWindow, ipcMain: IpcMain) {
    this.autoUpdater = autoUpdater;
    this.appWindow = appWindow;
    this.ipcMain = ipcMain;
    this.dispatcher = createDispatcher(this.appWindow);
  }

  changeAppWindow(appWindow: BrowserWindow) {
    this.appWindow = appWindow;
    this.dispatcher = createDispatcher(appWindow);
  }
  
  setup({
    isDev = false,
    port = 5050
  }: {
    isDev?: boolean,
    port?: number
  }) {
    const updater = createUpdater(this.autoUpdater);
    if(isDev) {
      updater.fake();
      const api = new UpdaterDevServer(this.dispatcher, {
        port
      });
      api.startServer();
    } else {
      this.autoUpdater.on('update-available', () => {
        this.dispatcher.onUpdateAvailable(true);
      });
  
      this.autoUpdater.on('update-not-available', () => {
        this.dispatcher.onUpdateAvailable(false);
      });
  
      this.autoUpdater.on('update-downloaded', () => {
        this.dispatcher.onDownloaded();
      });
  
      this.autoUpdater.on('error', (info) => {
        this.dispatcher.onError(info.message);
      });
    }

    this.ipcMain.handle(EVENT_INVOKE_KEY, (_, type: string) => {
      switch (type) {
        case HandlerType.checkForUpdates:
          return updater.checkForUpdates();
        case HandlerType.downloadUpdate:
          return updater.downloadUpdates();
        case HandlerType.quitAndInstall:
          return updater.quitAndInstall();
        default:
          break;
      }
    })
  }
}
