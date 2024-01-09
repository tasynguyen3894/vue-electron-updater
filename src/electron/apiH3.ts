
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
  <title>Vue Electron Updater</title>
</head>

<body>
  <!-- <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
    <polygon fill="#81c784" points="23.987,17 18.734,8 2.974,8 23.987,44 45,8 29.24,8"></polygon>
    <polygon fill="#455a64" points="29.24,8 23.987,17 18.734,8 11.146,8 23.987,30 36.828,8"></polygon>
  </svg> -->
  <style>
    .body {
      font-family: arial;
    }
    .container {
      width: 800px;
      margin: 0px auto;
    }

    .modal {
      position: fixed;
      width: 100%;
      height: 100vh;
      top: 0;
      left: 0;
    }

    .modal-overlay {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
    }

    .modal-content {
      position: absolute;
      background-color: #FFF;
      width: 400px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 5px;
      border-radius: 5px;
    }

    .modal-content-header {
      position: relative;
      padding: 5px;
      text-align: center;
      border: 1px solid #ccc;
      border-radius: 5px 5px 0px 0px;
    }

    .modal-content-content {
      text-align: center;
      padding: 10px;
    }

    .modal-content-content button {
      background: #333;
      cursor: pointer;
      border: 1px solid #333;
      color: #FFF;
      padding: 5px 10px;
      border-radius: 5px;
    }

    .modal-content-header button {
      position: absolute;
      right: 5px;
      cursor: pointer;
      padding: 0px 5px 2px;
      background: #333;
      border: 1px solid #333;
      color: #FFF;
      border-radius: 5px;
    }

    .modal-content button[disabled], .modal-content button[disabled]:hover {
      cursor: progress;
      background: #ccc;
      border-color: #ccc;
      color: #FFF;
    }

    .modal-content button:hover {
      background: #FFF;
      color: #333;
    }

    .modal-content-setting {
      margin: 10px 0px;
    }

    .event-table td {
      padding: 5px 0px;
    }

    .event-table button {
      cursor: pointer;
      background: #333;
      border: 1px solid #333;
      color: #FFF;
      border-radius: 5px;
      margin-left: 10px;
    }

    .hide {
      display: none;
    }
    
    .menu span {
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
    }

    .menu span.active, .menu span:hover {
      border-bottom: 1px solid #333;
    }

    .toast {
      position: fixed;
      left: 50%;
      transform: translate(-50%, -50%);
      bottom: -50px;
      background-color: #333;
      color: #FFF;
      padding: 5px 20px;
      transition: bottom 0.7s;
    }

    .toast.active {
      bottom: 30px;
      transition: bottom 0.7s;
    }
  </style>
  <noscript>
    "typesVersions": {
      "*": {
        "*": ["./dist/*.d.ts"]
      }
    },
  </noscript>
  <div class="container">
    <div class="header">
      
    </div>
    <div class="page">
      <h1>Vue Electron Updater Mock</h1>
      <div class="menu">
        <span id="to-home" class="active">Dashboard</span> | <span id="to-about">About</span>
      </div>
      <div id="about-page" class="hide">
About
      </div>
      <div id="event-page">
        <table class="event-table">
          <tbody>
            <tr>
              <td>Download version event</td>
              <td><button id="btn-open-downloaded">Send</button></td>
            </tr>
            <tr>
              <td>New version available event</td>
              <td><button id="btn-open-available">Send</button></td>
            </tr>
            <tr>
              <td>Error event</td>
              <td><button id="btn-open-error">Send</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="modal hide" id="downloaded-modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-content-header">
        Trigger Downloaded
        <button type="button" id="btn-close-downloaded">x</button>
      </div>
      <div class="modal-content-content">
        <button id="btn-send-downloaded" type="button">Send</button>
      </div>
    </div>
  </div>

  <div class="modal hide" id="available-modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-content-header">
        Trigger Available
        <button type="button" id="btn-close-available">x</button>
      </div>
      <div class="modal-content-content">
        <div class="modal-content-setting">Is update available? <input id="available" type="checkbox"></div>
        <button id="btn-send-available" type="button">Send</button>
      </div>
    </div>
  </div>

  <div class="modal hide" id="error-modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-content-header">
        Trigger Error
        <button type="button" id="btn-close-error">x</button>
      </div>
      <div class="modal-content-content">
        <div class="modal-content-setting">Input the error message <input id="error-message" type="text"></div>
        <button id="btn-send-error" type="button">Send</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">Sent</div>

  <script>
    function toggleModal(id, open = true) {
      const modal = document.getElementById(id);
      if(modal) {
        if(open) {
          modal.classList.remove('hide');
        } else {
          modal.classList.add('hide');
        }
      }
    }

    const actionConfig = {
      available: {
        buttonId: 'btn-open-available',
        modalId: 'available-modal',
        closeButtonId: 'btn-close-available',
        btnSendId: 'btn-send-available',
        sendHandler: sendAvailable
      },
      downloaded: {
        buttonId: 'btn-open-downloaded',
        modalId: 'downloaded-modal',
        closeButtonId: 'btn-close-downloaded',
        btnSendId: 'btn-send-downloaded',
        sendHandler: sendDownloaded
      },
      error: {
        buttonId: 'btn-open-error',
        modalId: 'error-modal',
        closeButtonId: 'btn-close-error',
        btnSendId: 'btn-send-error',
        sendHandler: sendError
      }
    };
    
    ['available', 'downloaded', 'error'].forEach((id) => {
      const { buttonId, modalId, closeButtonId, btnSendId, sendHandler } = actionConfig[id];
      document.getElementById(buttonId).addEventListener('click', () => {
        toggleModal(modalId, true);
      });

      document.getElementById(closeButtonId).addEventListener('click', () => {
        toggleModal(modalId, false);
      });

      document.getElementById(btnSendId).addEventListener('click', () => {
        sendHandler()
      });
    });

    document.getElementById('to-home').addEventListener('click', () => {
      changePage(true);
    });
    document.getElementById('to-about').addEventListener('click', () => {
      changePage(false);
    });

    function sendDownloaded() {
      sendRequest('/dispatch/downloaded', JSON.stringify({}), 'downloaded').then(() => {
        showMessage('downloaded', 'Sent');
      });
    }

    function sendAvailable() {
      sendRequest('/dispatch/available', JSON.stringify({ isAvailable: document.getElementById('available').checked }), 'available')
        .then(() => {
          document.getElementById('available').checked = false;
          showMessage('available', 'Sent');
        });
    }

    function sendError() {
      sendRequest('/dispatch/error', JSON.stringify({ message: document.getElementById('error-message').value }), 'error')
        .then(() => {
          document.getElementById('error-message').value = '';
          showMessage('error', 'Sent');
        });
    }

    function showMessage(id, message) {
      const { closeButtonId, btnSendId, modalId } = actionConfig[id];
      document.getElementById(closeButtonId).removeAttribute('disabled');
      document.getElementById(btnSendId).removeAttribute('disabled');
      toggleModal(modalId, false);
      document.getElementById('toast').classList.add('active');
      setTimeout(() => {
        document.getElementById('toast').classList.remove('active');
      }, 2000)
    }

    function addLoadingStyle(id) {
      const { closeButtonId, btnSendId } = actionConfig[id];
      document.getElementById(closeButtonId).setAttribute('disabled', true);
      document.getElementById(btnSendId).setAttribute('disabled', true);
    }

    function sendRequest(url, body, id) {
      addLoadingStyle(id);
      return fetch(url, {
        method: 'POST',
        body
      })
    }

    function changePage(toHome = false) {
      if(toHome) {
        document.getElementById('event-page').classList.remove('hide');
        document.getElementById('about-page').classList.add('hide');
        document.getElementById('to-home').classList.add('active');
        document.getElementById('to-about').classList.remove('active');
      } else {
        document.getElementById('event-page').classList.add('hide');
        document.getElementById('about-page').classList.remove('hide');
        document.getElementById('to-home').classList.remove('active');
        document.getElementById('to-about').classList.add('active');
      }
    }
  </script>
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
  protected port: number = 5050;

  constructor(dispatcher: Dispatcher, options: {
    port?: number
  } = {}) {
    this.dispatcher = dispatcher;
    const app = createApp();
    this.apiInstance = app;
    const dispatchApi = createRouter();
    dispatchApi.get('/', this.handleHomePage());
    dispatchApi.post('/dispatch/available', this.handleOnAvailable());
    dispatchApi.post('/dispatch/downloaded', this.handleOnDownloaded());
    dispatchApi.post('/dispatch/error', this.handleOnError());
    app.use(dispatchApi);
    if(options.port) {
      this.port = options.port
    }
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
