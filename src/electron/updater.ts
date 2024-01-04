import { AppUpdater, UpdateCheckResult } from 'electron-updater';

export interface Updater {
  downloadUpdates(): Promise<string[]>
  checkForUpdates(): Promise<UpdateCheckResult | null>
  quitAndInstall(): void,
  fake(): void,
  unfake(): void
}

export function createUpdater(autoUpdater: AppUpdater): Updater {
  let isFake: boolean = false;

  function checkForUpdates() {
    return isFake ? Promise.resolve(null) : autoUpdater.checkForUpdates();
  }
  
  function downloadUpdates() {
    return isFake ? Promise.resolve([]) : autoUpdater.downloadUpdate();
  }

  function quitAndInstall() {
    if(!isFake) {
      autoUpdater.quitAndInstall();
    }
  }

  return {
    downloadUpdates,
    checkForUpdates,
    quitAndInstall,
    fake() {
      isFake = true;
    },
    unfake() {
      isFake = false;
    }
  }
}
