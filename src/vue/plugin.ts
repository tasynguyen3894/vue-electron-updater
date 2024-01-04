import { Plugin, App, ref, inject, Ref } from 'vue';

import { EVENT_MESSAGE_KEY, ELECONTRON_WINDOW_KEY, EVENT_INVOKE_KEY, UpdateState, EventType, HandlerType, InjectKey } from '../electron/constant';

export type AutoUpdaterProvide = {
  downloadUpdate(): Promise<any>,
  checkForUpdates(): Promise<any>,
  startListen(): void,
  quitAndInstall(): void,
  updateState: Ref<UpdateState>,
  updateIsAvailable: Ref<boolean | undefined>,
  updateErrorMessage: Ref<string | undefined>
}

export function useAutoUpdater() {
  return inject(InjectKey) as AutoUpdaterProvide;
}

export function createApplicationUpdater(): Plugin {
  return {
    install(app: App) {
      const updateState = ref<UpdateState>(UpdateState.notUpdate);
      const updateIsAvailable = ref<boolean | undefined>(undefined);
      const updateErrorMessage = ref<string | undefined>();
      function startListen() {
        window[ELECONTRON_WINDOW_KEY][EVENT_MESSAGE_KEY]((_: any, { type, value }: { type: string, value: { [key: string]: any } }) => {
          switch (type) {
            case EventType.error:
              if(value.message) {
                updateErrorMessage.value = value.message;
              }
              updateState.value = UpdateState.error;
              break;
            case EventType.updateAvailable:
              updateIsAvailable.value = true;
              break;
            case EventType.updateNotAvailable:
              updateIsAvailable.value = false;
              break;
            case EventType.updateDownloaded:
              if(updateState.value !== UpdateState.downloaded) {
                updateState.value = UpdateState.downloaded;
              }
              break;
            default:
              break;
          }
        });
      }
      function downloadUpdate() {
        updateState.value = UpdateState.downloading;
        return window[ELECONTRON_WINDOW_KEY][EVENT_INVOKE_KEY](HandlerType.downloadUpdate);
      }
      function checkForUpdates() {
        updateIsAvailable.value = undefined;
        return window[ELECONTRON_WINDOW_KEY][EVENT_INVOKE_KEY](HandlerType.checkForUpdates);
      }
      function quitAndInstall() {
        return window[ELECONTRON_WINDOW_KEY][EVENT_INVOKE_KEY](HandlerType.quitAndInstall);
      }
      app.provide<AutoUpdaterProvide>(InjectKey, {
        startListen,
        downloadUpdate,
        checkForUpdates,
        updateState,
        updateIsAvailable,
        updateErrorMessage,
        quitAndInstall
      });
      app.config.globalProperties.$autoUpdater = {
        startListen,
        downloadUpdate,
        checkForUpdates,
        updateState,
        updateIsAvailable,
        updateErrorMessage,
        quitAndInstall
      }
    }
  }
}
