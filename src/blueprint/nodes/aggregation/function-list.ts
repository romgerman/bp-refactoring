import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class FunctionListNode extends BlueprintNode {
  readonly type: string = NodeTypes.FunctionList;

  override async evaluate() {
    const array = await this.evalInput<(ts.SourceFile | ts.FunctionDeclaration)[]>(0);

    if (!array || (!isArrayOfType(array, ts.isSourceFile) && !isArrayOfType(array, ts.isFunctionDeclaration))) {
      throw new Error("Expected SourceFile[] or ClassDeclaration[] at input 0");
    }

    return this.getFunctionList(array);
  }

  private getFunctionList(array: Array<ts.SourceFile | ts.FunctionDeclaration>): ts.FunctionDeclaration[] {
    if (isArrayOfType(array, ts.isFunctionDeclaration)) {
      return array as ts.FunctionDeclaration[];
    }

    return array
      .flatMap((file) =>
        ts.forEachChild(file, (node) => {
          if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            return node;
          } else {
            return null;
          }
        })
      )
      .filter((x) => !!x) as ts.FunctionDeclaration[];
  }

  async getViewData(): Promise<string[]> {
    const array = await this.evalInput<ts.SourceFile[]>(0);

    if (!array || (!isArrayOfType(array, ts.isSourceFile) && !isArrayOfType(array, ts.isFunctionDeclaration))) {
      return [];
    }

    return this.getFunctionList(array)
      .map((x) => x.name?.getText())
      .filter((x) => x) as string[];
  }
}
