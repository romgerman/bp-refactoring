import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphNodeDisconnected } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphNodeDisconnectedEventHandler implements IExtensionEventHandler<GraphNodeDisconnected> {
  readonly command: "graph:node-disconnected" = "graph:node-disconnected";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeDisconnected["data"], panel: vscode.WebviewPanel): Promise<void> {
    this.store.diconnect(data?.sourceId!, data?.targetId!);
  }
}
