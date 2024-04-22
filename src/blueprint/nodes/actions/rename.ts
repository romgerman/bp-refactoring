import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class RenameActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.RenameAction;

  async evaluate(): Promise<any> {
    const tsDeclList = await this.evalInput<ts.ClassDeclaration[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!tsDeclList) {
      throw new Error("Expected Array at input 0");
    }

    let renameType: "class" | "function" | "file" | null = null;

    if (isArrayOfType(tsDeclList, ts.isClassDeclaration)) {
      renameType = "class";
    } else if (isArrayOfType(tsDeclList, ts.isFunctionDeclaration)) {
      renameType = "function";
    } else {
      throw new Error("Expected ClassDeclaration[] or FunctionDeclaration[] at input 0");
    }

    const transformer = (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node) => {
        if (renameType === "class" && ts.isClassDeclaration(node) && node.name) {
          const name = this.getNewName(node.name.getText(sourceFile), fullName, prefix, postfix);
          const nameIdentifier = ts.factory.createIdentifier(name);

          this.renameSymbol(sourceFile, node, nameIdentifier);

          return ts.factory.updateClassDeclaration(
            node,
            node.modifiers,
            nameIdentifier,
            node.typeParameters,
            node.heritageClauses,
            node.members
          );
        } else if (renameType === "function" && ts.isFunctionDeclaration(node) && node.name) {
          const name = this.getNewName(node.name.getText(sourceFile), fullName, prefix, postfix);
          const nameIdentifier = ts.factory.createIdentifier(name);

          this.renameSymbol(sourceFile, node, nameIdentifier);

          return ts.factory.updateFunctionDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            nameIdentifier,
            node.typeParameters,
            node.parameters,
            node.type,
            node.body
          );
        }

        return ts.visitEachChild(node, visitor, undefined);
      };

      return ts.visitNode(sourceFile, visitor);
    };

    return tsDeclList.map((x) => x.getSourceFile()).map(transformer);
  }

  private renameSymbol(sourceFile: ts.SourceFile, node: ts.Node & { name?: ts.Identifier }, newNode: ts.Identifier): void {
    if (!node.name) {
      return;
    }

    const languageService = this.compiler.languageService?.services;
    const renameLocations = languageService?.findRenameLocations(sourceFile.fileName, node.name.pos, false, false, {});
    const changeTracker = this.compiler.changeTracker;

    if (renameLocations) {
      for (const rename of renameLocations) {
        const refSource = this.compiler.builderProgram?.getSourceFile(rename.fileName)!;
        changeTracker.replaceNode({
          sourceFile: refSource,
          node: newNode,
          span: rename.textSpan,
        });
      }
    }
  }

  private renameFiles(): void {
    const languageService = this.compiler.languageService?.services;
    //languageService?.getEditsForFileRename()
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
    const tsDeclList = await this.evalInput<ts.ClassDeclaration[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    return tsDeclList?.filter((x) => !!x.name).map((x) => this.getNewName(x.name!.getText(), fullName, prefix, postfix)) ?? [];
  }
}
