
import { UpdateCheckResult } from 'electron-updater';
import { Dispatcher } from './dispatcher';

import { createServer, Server } from "http";
import { createApp, toNodeListener, App, eventHandler, createRouter, readRawBody } from 'h3';

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    sdfdsfsdfsd
</body>
</html>
`


export interface Updater {
  downloadUpdates(): Promise<string[]>
  checkForUpdates(): Promise<UpdateCheckResult | null>
  quitAndInstall(): void
}

export class UpdaterDevServer {
  private apiInstance: App;
  protected apiServer: Server | undefined;
  protected dispatcher: Dispatcher;

  constructor(dispatcher: Dispatcher) {
    this.dispatcher = dispatcher;
    const app = createApp();
    this.apiInstance = app;
    const dispatchApi = createRouter();
    dispatchApi.get('/', this.handleHomePage());
    dispatchApi.post('/dispatch/available', this.handleOnAvailable());
    dispatchApi.post('/dispatch/downloaded', this.handleOnDownloaded());
    dispatchApi.post('/dispatch/error', this.handleOnError());
    app.use(dispatchApi);
  }

  public startServer() {
    this.apiServer = createServer(toNodeListener(this.apiInstance));
    this.apiServer.listen(5050);
  }

  public stopServer() {
    if(this.apiServer) {
      this.apiServer.close();
    }
  }

  protected handleHomePage() {
    return eventHandler(() => indexHtml);
  }

  protected handleOnError() {
    return eventHandler(async (event) => {
      try {
        const body = await readRawBody(event)
        if(body) {
          const { message = '' } = JSON.parse(body);
          this.dispatcher.onError(message);
        }
      } catch (error) {
        
      }
      return {
        status: true
      };
    })
  }

  protected handleOnDownloaded() {
    return eventHandler(() => {
      this.dispatcher.onDownloaded();
      return {
        status: true
      }
    })
  }

  protected handleOnAvailable() {
    return eventHandler(async (event) => {
      try {
        const body = await readRawBody(event)
        if(body) {
          const { isAvailable = false } = JSON.parse(body);
          this.dispatcher.onUpdateAvailable(isAvailable === true);
        }
      } catch (error) {
        
      }
      return {
        status: true
      };
    })
  }
}
