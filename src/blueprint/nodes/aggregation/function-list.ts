import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class FunctionListNode extends BlueprintNode {
  readonly type: string = NodeTypes.FunctionList;

  override async evaluate() {
    const tsFileList = await this.evalInput<Array<ts.SourceFile | ts.FunctionDeclaration>>(0);

    if (!tsFileList || (!isArrayOfType(tsFileList, ts.isSourceFile) && !isArrayOfType(tsFileList, ts.isFunctionDeclaration))) {
      throw new Error("Expected SourceFile[] or ClassDeclaration[] at input 0");
    }

    return this.getFunctionList(tsFileList);
  }

  private getFunctionList(tsFileList: Array<ts.SourceFile | ts.FunctionDeclaration>): ts.FunctionDeclaration[] {
    if (isArrayOfType(tsFileList, ts.isFunctionDeclaration)) {
      return tsFileList as ts.FunctionDeclaration[];
    }

    return tsFileList
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
    const tsFileList = await this.evalInput<ts.SourceFile[]>(0);

    if (!tsFileList || (!isArrayOfType(tsFileList, ts.isSourceFile) && !isArrayOfType(tsFileList, ts.isFunctionDeclaration))) {
      return [];
    }

    return this.getFunctionList(tsFileList)
      .map((x) => x.name?.getText())
      .filter((x) => x) as string[];
  }
}
