import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphClean } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphCleanEventHandler implements IExtensionEventHandler<GraphClean> {
  readonly command: "graph:clean" = "graph:clean";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphClean["data"], panel: vscode.WebviewPanel): Promise<boolean> {
    this.store.clean();
    return true;
  }
}
