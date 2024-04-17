import * as vscode from "vscode";
import type { FlowExportObject } from "@vue-flow/core";
import { IExtensionEventHandler } from "../extension-event-bus";
import { UpdateNodeGraph } from "../../shared/events";
import { BlueprintNode, ClassListNode, FilterByDecorator, ProjectNode } from "../../blueprint/blueprint-nodes";
import { TypescriptCompiler } from "../../compiler/typescript";

export class UpdateNodeGraphEventHandler implements IExtensionEventHandler<UpdateNodeGraph> {
  readonly command: "lifecycle:update-node-graph" = "lifecycle:update-node-graph";

  constructor(private readonly compiler: TypescriptCompiler) {}

  handle(data: FlowExportObject | undefined, panel: vscode.WebviewPanel): void {
    let current: BlueprintNode<any> = null!;
    for (const edge of data!.edges) {
      const sourceNode = data!.nodes.find(x => x.id === edge.source);
      const targetNode = data!.nodes.find(x => x.id === edge.target);

      if (!current) {
        current = this.getNode(sourceNode?.type!, null);
      }
      current = this.getNode(targetNode?.type!, current);
    }
    //console.log(current.evaluate());
  }

  private getNode(type: string, prevNode: BlueprintNode<any> | null): BlueprintNode<any> {
    switch (type) {
      case 'project': return new ProjectNode(this.compiler.builderProgram?.getProgram()!);
      case 'class-list': return new ClassListNode(prevNode);
      case 'has-decorator': return new FilterByDecorator(prevNode!, []);
      default: throw new Error('No node with type ' + type + ' was found');
    }
  }
}
