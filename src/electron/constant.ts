export const EVENT_MESSAGE_KEY = 'registerFrontHandler';
export const ELECONTRON_WINDOW_KEY = 'versionUpdateForElectron';
export const EVENT_INVOKE_KEY = 'versionUpdateElectronInvoker';
export const InjectKey = Symbol();

export enum EventType {
  updateAvailable = 'update-available',
  updateNotAvailable = 'update-not-available',
  updateDownloaded = 'update-downloaded',
  error = 'error'
}

export enum UpdateState {
  notUpdate = 'notUpdate',
  downloading = 'downloading',
  error =  'error',
  downloaded = 'downloaded'
}

export enum HandlerType {
  checkForUpdates = 'checkForUpdates',
  downloadUpdate = 'downloadUpdate',
  quitAndInstall = 'quitAndInstall'
}
