import { describe, vi, it, expect } from 'vitest';

import { createDispatcher } from '../dispatcher';
import { EVENT_MESSAGE_KEY, EventType } from '../constant';

describe('Test Dispatcher', () => {
  const webContentsSendMock = vi.fn();

  const dispatcher = createDispatcher({
    webContents: {
      send:webContentsSendMock
    }
  });

  it('Should  handle onDownloaded', () => {
    dispatcher.onDownloaded();
    expect(webContentsSendMock).toBeCalledWith(EVENT_MESSAGE_KEY, {
      type: EventType.updateDownloaded,
      value: {}
    });
  });

  it('Should handle onUpdateAvailable true', () => {
    dispatcher.onUpdateAvailable(true);
    expect(webContentsSendMock).toBeCalledWith(EVENT_MESSAGE_KEY, {
      type: EventType.updateAvailable,
      value: {}
    });
  });


  it('Should handle onUpdateAvailable false', () => {
    dispatcher.onUpdateAvailable(false);
    expect(webContentsSendMock).toBeCalledWith(EVENT_MESSAGE_KEY, {
      type: EventType.updateNotAvailable,
      value: {}
    });
  });

  it('Should  handle onError', () => {
    dispatcher.onError('error');
    expect(webContentsSendMock).toBeCalledWith(EVENT_MESSAGE_KEY, {
      type: EventType.error,
      value: {
        message: 'error'
      }
    });
  });
});
