import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class RenameClassActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.RenameClassAction;

  async evaluate(): Promise<any> {
    const tsClassList = await this.evalInput<ts.ClassDeclaration[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!tsClassList || !isArrayOfType(tsClassList, ts.isClassDeclaration)) {
      throw new Error("Expected ts.ClassDeclaration[] at input 0");
    }

    const transformer = (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
          if (node.name) {
            let name = this.getNewName(node.name.getText(sourceFile), fullName, prefix, postfix);

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

  private getNewName(name: string, fullName?: string, prefix?: string, postfix?: string): string {
    if (fullName) {
      name = fullName;
    }

    if (prefix) {
      name = `${prefix}${name}`;
    }

    if (postfix) {
      name = `${name}${postfix}`;
    }

    return name;
  }

  async getViewData(): Promise<any> {
    const tsClassList = await this.evalInput<ts.ClassDeclaration[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    return tsClassList?.filter((x) => !!x.name).map((x) => this.getNewName(x.name!.getText(), fullName, prefix, postfix)) ?? [];
  }
}
