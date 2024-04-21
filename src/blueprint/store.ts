import { TypescriptCompiler } from "../typescript/compiler";
import { NodeTypes } from "../shared/node-types";
import { EventEmitter } from "eventemitter3";
import { ROOT_NODES } from "./rules";
import { BlueprintNode } from "./blueprint-node";
import { ProjectNode } from "./nodes/project";
import { ApplyActionNode } from "./nodes/actions/apply";
import { DebugActionNode } from "./nodes/actions/debug";
import { RenameActionNode } from "./nodes/actions/rename";
import { ClassListNode } from "./nodes/aggregation/class-list";
import { FileListNode } from "./nodes/aggregation/file-list";
import { ConstantNode } from "./nodes/data/constant";
import { DecoratorPredicateNode } from "./nodes/filtering/decorator-predicate";
import { FilterByNode } from "./nodes/filtering/filter-by-node";
import { FunctionListNode } from "./nodes/aggregation/function-list";
import { MemberListNode } from "./nodes/aggregation/members-list";
import { OfTypePredicateNode } from "./nodes/filtering/of-type-predicate";
import { RegExpNode } from "./nodes/data/regexp";
import { PreviewNode } from "./nodes/aggregation/preview";

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
    this.events.emit("node-state-changed", { id: viewId, state: state, targetNode: node });
  }

  async evaluateNode(viewId: string): Promise<any> {
    const node = this.viewMap.get(viewId);

    if (!node) {
      throw new Error("Node not found. Id " + viewId);
    }

    return await node.evaluate();
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
    let targetNode: BlueprintNode | undefined = node;

    do {
      result.push({
        id: this.viewMapInverse.get(targetNode)!,
        data: await targetNode.getViewData(),
      });
      targetNode = targetNode.outputs[0];
    } while (targetNode?.hasOutputs);

    if (targetNode) {
      result.push({
        id: this.viewMapInverse.get(targetNode)!,
        data: await targetNode.getViewData(),
      });
    }

    return result;
  }

  getNodeByType(type: string): BlueprintNode {
    switch (type) {
      case NodeTypes.Project:
        return new ProjectNode(this.compiler);
      case NodeTypes.ClassList:
        return new ClassListNode(this.compiler);
      case NodeTypes.FileList:
        return new FileListNode(this.compiler);
      case NodeTypes.FunctionList:
        return new FunctionListNode(this.compiler);
      case NodeTypes.MemberList:
        return new MemberListNode(this.compiler);
      case NodeTypes.Preview:
        return new PreviewNode(this.compiler);
      case NodeTypes.FilterBy:
        return new FilterByNode(this.compiler);
      case NodeTypes.DecoratorPredicate:
        return new DecoratorPredicateNode(this.compiler);
      case NodeTypes.OfTypePredicate:
        return new OfTypePredicateNode(this.compiler);
      case NodeTypes.RenameAction:
        return new RenameActionNode(this.compiler);
      case NodeTypes.DebugAction:
        return new DebugActionNode(this.compiler);
      case NodeTypes.ApplyAction:
        return new ApplyActionNode(this.compiler);
      case NodeTypes.Constant:
        return new ConstantNode(this.compiler);
      case NodeTypes.RegExp:
        return new RegExpNode(this.compiler);
      default:
        throw new Error(`NodeType.${type} is not processed`);
    }
  }
}
