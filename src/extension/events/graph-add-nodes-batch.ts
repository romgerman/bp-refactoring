import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphAddNodesBatch } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { NodeTypes } from "../../shared/node-types";

export class GraphNodeAddNodesBatchEventHandler implements IExtensionEventHandler<GraphAddNodesBatch> {
  readonly command: "graph:add-nodes-batch" = "graph:add-nodes-batch";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphAddNodesBatch["data"], panel: vscode.WebviewPanel): Promise<void> {
    if (data) {
      for (const node of data.nodes) {
        this.store.addNode(node.id, this.store.getNodeByType(node.type as NodeTypes));
      }
    }
  }
}
