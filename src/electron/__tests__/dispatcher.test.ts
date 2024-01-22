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
    })
  });
});
