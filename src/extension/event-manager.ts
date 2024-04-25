import { Webview } from "vscode";
import { EventCommand } from "../shared/events";

export class EventManager {
  static sendEventCommand<T extends EventCommand<any, any>>(webview: Webview, command: T): void {
    webview.postMessage(command);
  }
}
