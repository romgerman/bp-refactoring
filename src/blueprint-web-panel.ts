import * as vscode from 'vscode';
import { getNonce, getUri } from './utils';

export class BlueprintWebPanel {
  public static currentPanel: BlueprintWebPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
  }

  dispose(): void {
    BlueprintWebPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const webviewUrl = getUri(webview, extensionUri, ['dist', 'main.webview.js']);
    const webviewStyleUrl = getUri(webview, extensionUri, ['dist', 'main.webview.css']);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
          <title>Hello World!</title>
          <link rel="stylesheet" type="text/css" href="${webviewStyleUrl}" />
        </head>
        <body>
          <div id="app"></div>
          <script type="module" nonce="${nonce}" src="${webviewUrl}"></script>
        </body>
      </html>
    `;
  }

  static render(extensionUri: vscode.Uri): void {
    if (BlueprintWebPanel.currentPanel) {
      BlueprintWebPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel('hello-world', 'Hello world', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      });

      BlueprintWebPanel.currentPanel = new BlueprintWebPanel(panel, extensionUri);
    }
  }
}
