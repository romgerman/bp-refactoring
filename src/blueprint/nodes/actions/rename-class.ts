import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class RenameClassActionNode extends BlueprintNode<string> {
  readonly type: string = NodeTypes.RenameClassAction;

  async evaluate(): Promise<any> {
    const tsClassList: ts.ClassDeclaration[] = await this.evalInput(0);

    if (!isArrayOfType(tsClassList, ts.isClassDeclaration)) {
      throw new Error("Expected ts.ClassDeclaration[]");
    }

    const transformer = (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
          if (node.name) {
            const name = this.state ?? node.name.getText(sourceFile);
            return ts.factory.updateClassDeclaration(
              node,
              node.modifiers,
              ts.factory.createIdentifier(name),
              node.typeParameters,
              node.heritageClauses,
              node.members
            );
          }
        }
        return ts.visitEachChild(node, visitor, undefined);
      };

      return ts.visitNode(sourceFile, visitor);
    };

    return tsClassList.map((x) => x.getSourceFile()).map(transformer);
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
