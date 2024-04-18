import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphNodeConnected } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphNodeConnectedEventHandler implements IExtensionEventHandler<GraphNodeConnected> {
  readonly command: "graph:node-connected" = "graph:node-connected";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeConnected["data"], panel: vscode.WebviewPanel): Promise<void> {
    this.store.connect(data?.sourceId!, data?.targetId!);
  }
}
