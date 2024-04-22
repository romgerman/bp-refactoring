import * as vscode from "vscode";
import { BlueprintStore } from "../../blueprint/store";
import { ApplyChanges, GraphNodeAdded } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { NodeTypes } from "../../shared/node-types";
import { TypescriptCompiler } from "../../typescript/compiler";

export class ApplyChangesEventHandler implements IExtensionEventHandler<ApplyChanges> {
  readonly command: "lifecycle:apply" = "lifecycle:apply";

  constructor(private readonly store: BlueprintStore, private readonly compiler: TypescriptCompiler) {}

  async handle(data: GraphNodeAdded["data"], panel: vscode.WebviewPanel): Promise<void> {
    const applyNode = this.store.nodes.find((x) => x.type === NodeTypes.ApplyAction);
    if (applyNode) {
      const nodes = await this.store.evaluateGraph(this.store.getNodeId(applyNode)!);
      //this.compiler.emit(nodes);
      this.compiler.changeTracker.appyChanges();
    }
  }
}
