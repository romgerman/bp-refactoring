import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphConnectNodesBatch } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphConnectNodesBatchEventHandler implements IExtensionEventHandler<GraphConnectNodesBatch> {
  readonly command: "graph:connect-nodes-batch" = "graph:connect-nodes-batch";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphConnectNodesBatch["data"], panel: vscode.WebviewPanel): Promise<void> {
    if (data) {
      for (const node of data.nodes) {
        const source = {
          id: node.sourceId,
          index: node.sourceIndex,
        };
        const target = {
          id: node.targetId,
          index: node.targetIndex,
        };
        this.store.connect(source, target);
      }
    }
  }
}
