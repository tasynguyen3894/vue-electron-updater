import { EVENT_MESSAGE_KEY, ELECONTRON_WINDOW_KEY, EVENT_INVOKE_KEY } from './electron/constant';

declare global {
  interface Window {
    [ELECONTRON_WINDOW_KEY]: {
      [EVENT_MESSAGE_KEY]: (a: any) => Promise<any>,
      [EVENT_INVOKE_KEY]: (a: any) => Promise<any>,
    }
  }
}
