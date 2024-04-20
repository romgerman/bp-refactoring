import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class OfTypePredicateNode extends BlueprintNode<{ type: string }> {
  readonly type: string = NodeTypes.OfTypePredicate;

  async evaluate(): Promise<any> {
    return [];
  }

  async getViewData(): Promise<any> {
    return [];
  }
}
