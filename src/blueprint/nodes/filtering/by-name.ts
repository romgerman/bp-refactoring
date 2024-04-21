import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";

export class ByNamePredicateNode extends PredicateNode {
  readonly type: string = NodeTypes.ByNamePredicate;

  async evaluate(): Promise<Function> {
    return async (array: ts.Node[]) => {};
  }

  getViewData(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
