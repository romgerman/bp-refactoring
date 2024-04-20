import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class ClassListNode extends BlueprintNode {
  readonly type: string = NodeTypes.ClassList;

  override async evaluate() {
    const tsFileList = await this.evalInput<Array<ts.SourceFile | ts.ClassDeclaration>>(0);

    if (!tsFileList || (!isArrayOfType(tsFileList, ts.isSourceFile) && !isArrayOfType(tsFileList, ts.isClassDeclaration))) {
      throw new Error("Expected SourceFile[] or ClassDeclaration[] at input 0");
    }

    return this.getClassList(tsFileList);
  }

  private getClassList(tsFileList: Array<ts.SourceFile | ts.ClassDeclaration>): ts.ClassDeclaration[] {
    if (isArrayOfType(tsFileList, ts.isClassDeclaration)) {
      return tsFileList as ts.ClassDeclaration[];
    }

    return tsFileList
      .flatMap((file) =>
        ts.forEachChild(file, (node) => {
          if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            return node;
          } else {
            return null;
          }
        })
      )
      .filter((x) => !!x) as ts.ClassDeclaration[];
  }

  async getViewData(): Promise<string[]> {
    const tsFileList = await this.evalInput<ts.SourceFile[]>(0);

    if (!tsFileList || (!isArrayOfType(tsFileList, ts.isSourceFile) && !isArrayOfType(tsFileList, ts.isClassDeclaration))) {
      return [];
    }

    return this.getClassList(tsFileList)
      .map((x) => x.name?.getText())
      .filter((x) => x) as string[];
  }
}
