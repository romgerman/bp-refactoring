import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";
import { isArrayOfType } from "../../helpers";
import { BlueprintNodeError } from "../../node-error";

export enum TsNodeType {
  ClassDeclaration = "class-decl",
  MethodDeclaration = "method-decl",
  FunctionDeclaration = "function-decl",
}

export class OfTypePredicateNode extends PredicateNode<{ type: TsNodeType }> {
  readonly type: string = NodeTypes.OfTypePredicate;

  async evaluate(): Promise<any> {
    return async (array: ts.Node[]) => {
      if (!this.state?.type) {
        return [];
      }

      if (array === undefined) {
        throw new BlueprintNodeError("Expected Node[] at input 0", this);
      }

      if (this.state.type === TsNodeType.ClassDeclaration) {
        return this.getNodesOfType(array, ts.isClassDeclaration);
      } else if (this.state.type === TsNodeType.FunctionDeclaration) {
        return this.getNodesOfType(array, ts.isFunctionDeclaration);
      } else if (this.state.type === TsNodeType.MethodDeclaration) {
        return this.getNodesOfType(array, ts.isMethodDeclaration);
      }

      return [];
    };
  }

  private getNodesOfType(array: ts.Node[], predicate: Function) {
    if (isArrayOfType(array, ts.isSourceFile)) {
      const result: ts.Node[] = [];
      for (let sourceFile of array) {
        ts.forEachChild(sourceFile, (node) => {
          if (predicate(node)) {
            result.push(node);
          }
        });
      }
      return result;
    } else {
      return array.filter((n) => predicate(n));
    }
  }

  async getViewData(): Promise<any> {
    return [];
  }
}
