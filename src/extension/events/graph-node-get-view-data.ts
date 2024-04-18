import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { GraphNodeGetViewData, GraphNodeSendViewData } from "../../shared/events";
import { sendEventCommand } from "../../utils";
import { IExtensionEventHandler } from "../extension-event-bus";

export class GraphNodeGetViewDataEventHandler implements IExtensionEventHandler<GraphNodeGetViewData> {
  readonly command: "graph:node-get-view-data" = "graph:node-get-view-data";

  constructor(private readonly store: BlueprintStore) {}

  async handle(data: GraphNodeGetViewData["data"], panel: vscode.WebviewPanel): Promise<void> {
    try {
      const result = await this.store.getViewData(data?.id!);
      for (let d of result) {
        sendEventCommand<GraphNodeSendViewData>(panel.webview!, {
          command: "graph:node-send-view-data",
          data: { id: d.id, data: d.data },
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }
}
