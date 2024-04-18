import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphNodeRemoved } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphNodeRemovedEventHandler implements IExtensionEventHandler<GraphNodeRemoved> {
  readonly command: "graph:node-removed" = "graph:node-removed";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeRemoved["data"], panel: vscode.WebviewPanel): Promise<void> {
    this.store.removeNode(data?.id!);
  }
}
