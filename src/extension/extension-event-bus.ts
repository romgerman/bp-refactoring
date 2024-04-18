import * as vscode from "vscode";
import { EventCommand } from "../shared/events/event-command";
import { sendEventCommand } from "../utils";

export interface IExtensionEventHandler<T extends EventCommand<any, any>> {
  readonly command: T["command"];
  handle(data: T["data"], panel: vscode.WebviewPanel): any;
}

export class ExtensionEventBus {
  private _events: Map<string, Set<IExtensionEventHandler<any>>> = new Map();

  constructor() {}

  async emit<T extends EventCommand<any, any>>(command: T, panel: vscode.WebviewPanel): Promise<void> {
    for (const handler of this._events.get(command.command)?.values() ?? []) {
      const retVal = await handler.handle(command.data, panel);
      if (!retVal) {
        continue;
      }
      sendEventCommand(panel.webview, {
        command: handler.command,
        data: retVal,
      });
    }
  }

  addHandler<T extends EventCommand<any, any>>(handler: IExtensionEventHandler<T>): this {
    if (this._events.get(handler.command)) {
      this._events.get(handler.command)?.add(handler);
    } else {
      this._events.set(handler.command, new Set([handler]));
    }

    return this;
  }

  removeHandler<T extends EventCommand<any, any>>(handler: IExtensionEventHandler<T>): void {
    if (this._events.has(handler.command)) {
      this._events.get(handler.command)?.delete(handler);
    } else {
      console.warn("No handlers found matching command " + handler.command);
    }
  }
}
