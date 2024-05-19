import ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";
import { isArrayOfType } from "../../helpers";
import { NamedNode } from "../../../extension/types";
import { BlueprintNodeError } from "../../node-error";

export class ByRegExpPredicateNode extends PredicateNode<{ value: string }> {
  readonly type: string = NodeTypes.ByRegExpPredicate;

  async evaluate(): Promise<Function> {
    return async (array: ts.Node[]) => {
      try {
        const regex = new RegExp(this.state?.value || "");
        const predicate = (data: string) => regex.test(data);

        if (isArrayOfType(array, ts.isSourceFile)) {
          return array.filter((sf) => predicate(sf.fileName));
        } else {
          const result = array.filter((entry) => {
            const name = (entry as NamedNode).name?.getText() || "";
            return predicate(name);
          });

          return result;
        }
      } catch {
        throw new BlueprintNodeError("Invalid regular expression", this);
      }
    };
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
