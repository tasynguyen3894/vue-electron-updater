import { AppUpdater, UpdateCheckResult } from 'electron-updater';

export interface Updater {
  downloadUpdates(): Promise<string[]>
  checkForUpdates(): Promise<UpdateCheckResult | null>
  quitAndInstall(): void,
  fake(): void,
  unfake(): void,
  mockDownloadUpdate(data: string[]): void
}

export class UpdaterService implements Updater {
  protected autoUpdater: AppUpdater;
  protected isFake = false;
  protected mockDownloadData: string[] = [];

  constructor(autoUpdater: AppUpdater) {
    this.autoUpdater = autoUpdater;
  }

  checkForUpdates() {
    return this.isFake ? Promise.resolve(null) : this.autoUpdater.checkForUpdates();
  }
  
  downloadUpdates() {
    return this.isFake ? Promise.resolve(this.mockDownloadData) : this.autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    if(!this.isFake) {
      this.autoUpdater.quitAndInstall();
    }
  }

  fake() {
    this.isFake = true;
  }

  unfake() {
    this.isFake = false;
  }

  mockDownloadUpdate(data: string[]) {
    this.mockDownloadData = data;
  }
}

export function createUpdater(autoUpdater: AppUpdater): Updater {
  return new UpdaterService(autoUpdater)
}