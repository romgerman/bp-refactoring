import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";
import { isArrayOfType } from "../../helpers";

export enum TsNodeType {
  ClassDeclaration = "class-decl",
  MethodDeclaration = "method-decl",
  FunctionDeclaration = "function-decl",
}

export class OfTypePredicateNode extends PredicateNode<{ type: string }> {
  readonly type: string = NodeTypes.OfTypePredicate;

  async evaluate(): Promise<any> {
    return async (array: ts.Node[]) => {
      if (!this.state?.type) {
        return [];
      }

      if (array === undefined) {
        throw new Error("Expected Node[] at input 0");
      }

      if (isArrayOfType(array, ts.isSourceFile)) {
        if (this.state.type === TsNodeType.ClassDeclaration) {
          return this.getNodesOfTypeFromSourceFiles(array, ts.isClassDeclaration);
        } else if (this.state.type === TsNodeType.FunctionDeclaration) {
          return this.getNodesOfTypeFromSourceFiles(array, ts.isFunctionDeclaration);
        } else if (this.state.type === TsNodeType.MethodDeclaration) {
          return this.getNodesOfTypeFromSourceFiles(array, ts.isMethodDeclaration);
        }
      } else {
        if (this.state.type === TsNodeType.ClassDeclaration) {
          return array.filter((n) => ts.isClassDeclaration(n));
        } else if (this.state.type === TsNodeType.FunctionDeclaration) {
          return array.filter((n) => ts.isFunctionDeclaration(n));
        } else if (this.state.type === TsNodeType.MethodDeclaration) {
          return array.filter((n) => ts.isMethodDeclaration(n));
        }
      }

      return [];
    };
  }

  private getNodesOfTypeFromSourceFiles(sourceFiles: ts.Node[], predicate: Function) {
    const result: ts.Node[] = [];
    for (let sourceFile of sourceFiles) {
      ts.forEachChild(sourceFile, (node) => {
        if (predicate(node)) {
          result.push(node);
        }
      });
    }
    return result;
  }

  async getViewData(): Promise<any> {
    return [];
  }
}
