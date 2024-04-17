import { FlowExportObject } from "@vue-flow/core";
import { BlueprintNode, ClassListNode, FilterByDecorator, ProjectNode } from "./blueprint-nodes";

export function convertFromVueFlow(data: FlowExportObject): BlueprintNode<any> {
  let current: BlueprintNode<any> = null!;
  for (const edge of data!.edges) {
    const sourceNode = data!.nodes.find((x) => x.id === edge.source);
    const targetNode = data!.nodes.find((x) => x.id === edge.target);

    if (!current) {
      current = getNode(sourceNode?.type!, null);
    }
    current = getNode(targetNode?.type!, current);
  }

  return current;
}

function getNode(type: string, prevNode: BlueprintNode<any> | null): BlueprintNode<any> {
  switch (type) {
    case "project":
      return new ProjectNode();
    case "class-list":
      return new ClassListNode(prevNode);
    case "has-decorator":
      return new FilterByDecorator(prevNode!, []);
    default:
      throw new Error("No node with type " + type + " was found");
  }
}
