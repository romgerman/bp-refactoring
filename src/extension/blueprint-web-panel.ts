import * as vscode from "vscode";
import { getNonce, getUri } from "./utils";
import { ExtensionEventBus } from "./extension-event-bus";
import { EventCommand } from "../shared/events/event-command";

export class BlueprintWebPanel {
  public static currentPanel: BlueprintWebPanel | undefined;

  public get panel(): vscode.WebviewPanel {
    return this._panel;
  }

  public get webview(): vscode.Webview {
    return this._panel.webview;
  }

  public disposed = false;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, private readonly eventBus: ExtensionEventBus) {
    this._panel = panel;
    this._panel.onDidDispose(
      () => {
        this.dispose();
        this.disposed = true;
      },
      null,
      this._disposables
    );
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._panel.webview.onDidReceiveMessage(
      (command: EventCommand<any, any>) => this.eventBus.emit(command, this.panel),
      null,
      this._disposables
    );
  }

  static createOrShow(extensionUri: vscode.Uri, eventBus: ExtensionEventBus): void {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (BlueprintWebPanel.currentPanel) {
      BlueprintWebPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel("hello-world", "Blueprint", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist")],
      retainContextWhenHidden: true,
    });
    BlueprintWebPanel.currentPanel = new BlueprintWebPanel(panel, extensionUri, eventBus);
  }

  dispose(): void {
    vscode.Disposable.from(this._panel, ...this._disposables).dispose();
    BlueprintWebPanel.currentPanel = undefined;
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const webviewUrl = getUri(webview, extensionUri, ["dist", "main.webview.js"]);
    const webviewStyleUrl = getUri(webview, extensionUri, ["dist", "main.webview.css"]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';"
          />
          <title>Blueprint</title>
          <link rel="stylesheet" type="text/css" href="${webviewStyleUrl}" />
        </head>
        <body>
          <div id="app"></div>
          <script type="module" nonce="${nonce}" src="${webviewUrl}"></script>
        </body>
      </html>
    `;
  }
}
