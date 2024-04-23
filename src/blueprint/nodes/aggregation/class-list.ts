import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class ClassListNode extends BlueprintNode {
  readonly type: string = NodeTypes.ClassList;

  override async evaluate(): Promise<ts.ClassDeclaration[]> {
    const array = await this.evalInput<(ts.SourceFile | ts.ClassDeclaration)[]>(0);

    if (!array || (!isArrayOfType(array, ts.isSourceFile) && !isArrayOfType(array, ts.isClassDeclaration))) {
      throw new Error("Expected SourceFile[] or ClassDeclaration[] at input 0");
    }

    return this.getClassList(array);
  }

  private getClassList(array: Array<ts.SourceFile | ts.ClassDeclaration>): ts.ClassDeclaration[] {
    if (isArrayOfType(array, ts.isClassDeclaration)) {
      return array;
    }

    return array
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
    const array = await this.evalInput<ts.SourceFile[]>(0);

    if (!array || (!isArrayOfType(array, ts.isSourceFile) && !isArrayOfType(array, ts.isClassDeclaration))) {
      return [];
    }

    return this.getClassList(array)
      .map((x) => x.name?.getText())
      .filter((x) => x) as string[];
  }
}
