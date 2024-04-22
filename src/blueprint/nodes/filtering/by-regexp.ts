import ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";

export class ByRegExpPredicateNode extends PredicateNode<{ value: string }> {
  readonly type: string = NodeTypes.ByRegExpPredicate;

  async evaluate(): Promise<Function> {
    return async (array: ts.ClassDeclaration[]) => {
      try {
        const regex = new RegExp(this.state?.value || "");
        const predicate = (data: string) => regex.test(data);

        const result = array.filter((entry) => {
          const name = entry?.name?.getText() || "";
          if (name) {
            return predicate(name);
          } else {
            throw new Error("The name is not a string");
          }
        });

        return result;
      } catch {
        throw new Error("Invalid regular expression");
      }
    };
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
