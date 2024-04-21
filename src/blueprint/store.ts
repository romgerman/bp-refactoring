import { match } from "ts-pattern";
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
import { ByNamePredicateNode } from "./nodes/filtering/by-name";

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
      .with(NodeTypes.RenameAction, () => new RenameActionNode(this.compiler))
      .with(NodeTypes.DebugAction, () => new DebugActionNode(this.compiler))
      .with(NodeTypes.ApplyAction, () => new ApplyActionNode(this.compiler))
      .with(NodeTypes.Constant, () => new ConstantNode(this.compiler))
      .with(NodeTypes.ByNamePredicate, () => new ByNamePredicateNode(this.compiler))
      .exhaustive();
  }
}
