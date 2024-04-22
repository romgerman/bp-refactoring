import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class ByRegExpPredicateNode extends BlueprintNode<{ value: string }> {
  readonly type: string = NodeTypes.ByRegExpPredicate;

  async evaluate(): Promise<any> {
    try {
      const regex = new RegExp(this.state?.value || "");
      const predicate = (data: string) => regex.test(data);
      return predicate;
    } catch {
      throw new Error("Incorrect regular expression");
    }
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
