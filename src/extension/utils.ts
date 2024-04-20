import { Uri, Webview } from "vscode";
import { EventCommand } from "../shared/events/event-command";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function getNonce() {
  let text = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return text;
}

export function sendEventCommand<T extends EventCommand<any, any>>(webview: Webview, command: T): void {
  webview.postMessage(command);
}
