import { EventEmitter } from "eventemitter3";
import { match } from "ts-pattern";
import { NodeTypes } from "../shared/node-types";
import { TypescriptCompiler } from "../typescript/compiler";
import { BlueprintNode } from "./blueprint-node";
import { ApplyActionNode } from "./nodes/actions/apply";
import { DebugActionNode } from "./nodes/actions/debug";
import { RenameFileActionNode } from "./nodes/actions/rename-file";
import { RenameSymbolActionNode } from "./nodes/actions/rename-symbol";
import { ClassListNode } from "./nodes/aggregation/class-list";
import { FileListNode } from "./nodes/aggregation/file-list";
import { FunctionListNode } from "./nodes/aggregation/function-list";
import { MemberListNode } from "./nodes/aggregation/members-list";
import { PreviewNode } from "./nodes/aggregation/preview";
import { ConstantNode } from "./nodes/data/constant";
import { ByGlobPredicateNode } from "./nodes/filtering/by-glob";
import { ByModifierPredicateNode } from "./nodes/filtering/by-modifier";
import { ByRegExpPredicateNode } from "./nodes/filtering/by-regexp";
import { DecoratorPredicateNode } from "./nodes/filtering/decorator-predicate";
import { FilterByNode } from "./nodes/filtering/filter-by-node";
import { OfTypePredicateNode } from "./nodes/filtering/of-type-predicate";
import { ProjectNode } from "./nodes/project";
import { ROOT_NODES } from "./rules";

export class BlueprintStore {
  readonly events = new EventEmitter<
    "node-added" | "node-removed" | "node-connected" | "node-disconnected" | "node-state-changed"
  >();

  nodes: BlueprintNode[] = [];
  rootNode: BlueprintNode | null = null;
  viewMap: Map<string, BlueprintNode> = new Map();
  viewMapInverse: Map<BlueprintNode, string> = new Map();

  constructor(private readonly compiler: TypescriptCompiler) {}

  getNodeId(node: BlueprintNode): string | undefined {
    return this.viewMapInverse.get(node);
  }

  getNode(viewId: string): BlueprintNode | undefined {
    return this.viewMap.get(viewId);
  }

  addNode(viewId: string, node: BlueprintNode): void {
    this.nodes.push(node);
    this.viewMap.set(viewId, node);
    this.viewMapInverse.set(node, viewId);
    if (ROOT_NODES.includes(node.type)) {
      this.rootNode = node;
    }
    this.events.emit("node-added", { id: viewId, node: node });
  }

  removeNode(viewId: string): void {
    const targetNode = this.viewMap.get(viewId);
    if (targetNode) {
      // Remove the node from node array
      const index = this.nodes.findIndex((n) => n === targetNode);
      this.nodes.splice(index, 1);

      // Clear outputs and inputs
      targetNode.outputs = [];
      targetNode.inputs = [];

      if (ROOT_NODES.includes(targetNode.type)) {
        this.rootNode = null;
      }

      // Remove the node from map
      this.viewMap.delete(viewId);
      this.viewMapInverse.delete(targetNode);
    }

    this.events.emit("node-removed", { id: viewId });
  }

  connect(source: { id: string; index: number }, target: { id: string; index: number }): void {
    const sourceNode = this.viewMap.get(source.id);
    const targetNode = this.viewMap.get(target.id);

    if (!sourceNode) {
      throw new Error("Source node not found");
    }

    if (!targetNode) {
      throw new Error("Target node not found");
    }

    targetNode.inputs[target.index] = sourceNode;
    sourceNode.outputs[source.index] = targetNode;
    this.events.emit("node-connected", { sourceId: source.id, targetId: target.id, sourceNode, targetNode });
  }

  diconnect(sourceId: string, targetId: string): void {
    const sourceNode = this.viewMap.get(sourceId);
    const targetNode = this.viewMap.get(targetId);

    if (!sourceNode) {
      throw new Error("Source node not found. Id " + sourceId);
    }

    if (!targetNode) {
      throw new Error("Target node not found. Id " + targetId);
    }

    targetNode.inputs[targetNode.inputs.indexOf(sourceNode)] = undefined!;
    sourceNode.outputs[sourceNode.outputs.indexOf(targetNode)] = undefined!;
    this.events.emit("node-disconnected", { sourceId, targetId, sourceNode, targetNode });
  }

  setNodeState(viewId: string, state: any): void {
    const node = this.viewMap.get(viewId);

    if (!node) {
      throw new Error("Node not found. Id " + viewId);
    }

    node.state = state;
    node.onStateChanged();
    this.events.emit("node-state-changed", { id: viewId, state: state, targetNode: node });
  }

  async evaluateGraph(viewId: string): Promise<any> {
    const node = this.viewMap.get(viewId);

    if (!node) {
      throw new Error("Node not found. Id " + viewId);
    }

    let targetNode = node;

    while (targetNode.hasOutputs) {
      targetNode = targetNode.outputs[0];
    }

    return await targetNode.evaluate();
  }

  async getViewData(viewId: string): Promise<Array<{ id: string; data: any }>> {
    const node = this.viewMap.get(viewId);

    if (!node) {
      throw new Error("Node not found. Id " + viewId);
    }

    const result: Array<{ id: string; data: any }> = [];
    const queue: BlueprintNode[] = [node];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current) {
        result.push({
          id: this.getNodeId(current)!,
          data: await current.getViewData(),
        });

        for (const out of current.outputs) {
          queue.push(out);
        }
      }
    }

    return result;
  }

  clean(): void {
    this.rootNode = null;
    this.nodes = [];
    this.viewMap.clear();
    this.viewMapInverse.clear();
  }

  getNodeByType(type: NodeTypes): BlueprintNode {
    return match(type)
      .with(NodeTypes.Project, () => new ProjectNode(this.compiler))
      .with(NodeTypes.ClassList, () => new ClassListNode(this.compiler))
      .with(NodeTypes.FileList, () => new FileListNode(this.compiler))
      .with(NodeTypes.FunctionList, () => new FunctionListNode(this.compiler))
      .with(NodeTypes.MemberList, () => new MemberListNode(this.compiler))
      .with(NodeTypes.Preview, () => new PreviewNode(this.compiler))
      .with(NodeTypes.FilterBy, () => new FilterByNode(this.compiler))
      .with(NodeTypes.DecoratorPredicate, () => new DecoratorPredicateNode(this.compiler))
      .with(NodeTypes.OfTypePredicate, () => new OfTypePredicateNode(this.compiler))
      .with(NodeTypes.ByRegExpPredicate, () => new ByRegExpPredicateNode(this.compiler))
      .with(NodeTypes.RenameAction, () => new RenameSymbolActionNode(this.compiler))
      .with(NodeTypes.RenameFileAction, () => new RenameFileActionNode(this.compiler))
      .with(NodeTypes.DebugAction, () => new DebugActionNode(this.compiler))
      .with(NodeTypes.ApplyAction, () => new ApplyActionNode(this.compiler))
      .with(NodeTypes.Constant, () => new ConstantNode(this.compiler))
      .with(NodeTypes.ByGlobPredicate, () => new ByGlobPredicateNode(this.compiler))
      .with(NodeTypes.ByModifierPredicate, () => new ByModifierPredicateNode(this.compiler))
      .exhaustive();
  }
}
