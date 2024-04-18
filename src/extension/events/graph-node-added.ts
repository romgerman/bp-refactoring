import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphNodeAdded } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphNodeAddedEventHandler implements IExtensionEventHandler<GraphNodeAdded> {
  readonly command: "graph:node-added" = "graph:node-added";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeAdded["data"], panel: vscode.WebviewPanel): Promise<void> {
    this.store.addNode(data?.id!, this.store.getNodeByType(data?.type!));
  }
}
