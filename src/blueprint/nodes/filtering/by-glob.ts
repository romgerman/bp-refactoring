import ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";
import { minimatch } from "minimatch";
import { NamedNode } from "../../../extension/types";
import { isArrayOfType } from "../../helpers";

export class ByGlobPredicateNode extends PredicateNode<{ globPattern: string }> {
  readonly type: string = NodeTypes.ByGlobPredicate;

  async evaluate(): Promise<Function> {
    return (array: ts.Node[]) => {
      if (!this.state?.globPattern) {
        throw new Error("Expected glob pattern to be provided");
      }

      if (isArrayOfType(array, ts.isSourceFile)) {
        return array.filter((sf) => minimatch((sf as ts.SourceFile).fileName, this.state!.globPattern));
      }
      console.log(this.state);

      return array
        .filter((n) => (n as NamedNode).name !== undefined)
        .filter((n) => minimatch((n as NamedNode).name!.getText(), this.state!.globPattern));
    };
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}