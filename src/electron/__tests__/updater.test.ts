import { describe, it, expect } from 'vitest';

import { UpdaterService, ApplicationUpdater } from '../updater';


describe('Test UpdaterService', () => {
  const appUpdater: ApplicationUpdater = {
    downloadUpdate: () => Promise.resolve([]),
    checkForUpdates: () => Promise.resolve(null),
    quitAndInstall: () => {}
  }

  const updater = new UpdaterService(appUpdater);

  it('Should not use mock as default', () => {
    expect(updater.isMock()).toBeFalsy();
  });

  it('Should be mock after call useMock', () => {
    updater.useMock();
    expect(updater.isMock()).toBeTruthy();
  });

  it('Should be non mock after call stopMock', () => {
    updater.stopMock();
    expect(updater.isMock()).toBeFalsy();
  });

  it('Should return the download mock data', () => {
    const downloadMockData = ['1', '2', '3'];
    updater.mockDownloadUpdate(downloadMockData);
    updater.useMock();
    updater.downloadUpdates().then(result => {
      expect(result).toEqual(downloadMockData);
    })
  })
})
