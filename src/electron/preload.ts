import { EVENT_MESSAGE_KEY, ELECONTRON_WINDOW_KEY, EVENT_INVOKE_KEY } from './constant';

export function setupPreload(context: Electron.ContextBridge, ipcRenderer: Electron.IpcRenderer) {
  context.exposeInMainWorld(ELECONTRON_WINDOW_KEY, {
    [EVENT_MESSAGE_KEY]: (callback: any) => {
      ipcRenderer.on(EVENT_MESSAGE_KEY, callback);
      return () => {
        ipcRenderer.removeListener(EVENT_MESSAGE_KEY, callback)
      }
    },
    [EVENT_INVOKE_KEY](args: any) {
      ipcRenderer.invoke(EVENT_INVOKE_KEY, args)
    }
  });
}
