import { UpdateCheckResult } from 'electron-updater';

export interface Updater {
  downloadUpdates(): Promise<string[]>
  checkForUpdates(): Promise<UpdateCheckResult | null>
  quitAndInstall(): void,
  useMock(): void,
  stopMock(): void,
  isMock(): boolean,
  mockDownloadUpdate(data: string[]): void
}

export interface ApplicationUpdater {
  downloadUpdate(): Promise<string[]>
  checkForUpdates(): Promise<UpdateCheckResult | null>
  quitAndInstall(): void
}

export class UpdaterService implements Updater {
  protected autoUpdater: ApplicationUpdater;
  protected mock = false;
  protected mockDownloadData: string[] = [];

  constructor(autoUpdater: ApplicationUpdater) {
    this.autoUpdater = autoUpdater;
  }

  checkForUpdates() {
    return this.mock ? Promise.resolve(null) : this.autoUpdater.checkForUpdates();
  }
  
  downloadUpdates() {
    return this.mock ? Promise.resolve(this.mockDownloadData) : this.autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    if(!this.mock) {
      this.autoUpdater.quitAndInstall();
    }
  }

  useMock() {
    this.mock = true;
  }

  stopMock() {
    this.mock = false;
  }

  isMock() {
    return this.mock;
  }

  mockDownloadUpdate(data: string[]) {
    this.mockDownloadData = data;
  }
}

export function createUpdater(autoUpdater: ApplicationUpdater): Updater {
  return new UpdaterService(autoUpdater)
}