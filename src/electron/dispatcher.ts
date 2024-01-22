import { EVENT_MESSAGE_KEY, EventType } from './constant';

export type Dispatcher = {
  dispatch(type: string, value?: { [key: string]: any }): void,
  onUpdateAvailable(available: boolean): void;
  onDownloaded(): void;
  onError(message: string): void
}

export interface WebContents {
  send(channel: string, ...args: any[]): void
}

export interface BrowserWindow {
  webContents: WebContents
}

export function createDispatcher(appWindow: BrowserWindow): Dispatcher  {
  function dispatch(messageType: string, value = {}) {
    appWindow.webContents.send(EVENT_MESSAGE_KEY, {
      type: messageType,
      value
    });
  }
  return {
    dispatch,
    onDownloaded() {
      dispatch(EventType.updateDownloaded)
    },
    onError(message: string) {
      dispatch(EventType.error, { message })
    },
    onUpdateAvailable(available: boolean) {
      dispatch(available ? EventType.updateAvailable : EventType.updateNotAvailable)
    }
  }
}