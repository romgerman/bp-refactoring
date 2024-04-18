import * as vscode from "vscode";
import { GraphNodeUpdateState } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { BlueprintStore } from "../../blueprint/store";

export class GraphNodeUpdateStateEventHandler implements IExtensionEventHandler<GraphNodeUpdateState> {
  readonly command: "graph:node-update-state" = "graph:node-update-state";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeUpdateState["data"], panel: vscode.WebviewPanel): Promise<void> {
    this.store.setNodeState(data?.id!, data?.state);
  }
}
