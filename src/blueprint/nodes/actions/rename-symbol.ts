import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";
import { NamedNode } from "../../../extension/types";
import { BlueprintNodeError } from "../../node-error";

export class RenameSymbolActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.RenameAction;

  async evaluate(): Promise<any> {
    const tsDeclList = await this.evalInput<(ts.ClassDeclaration | ts.FunctionDeclaration | ts.MethodDeclaration)[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!tsDeclList) {
      throw new BlueprintNodeError("Expected Array at input 0", this);
    }

    let renameType: "class" | "function" | "method" | null = null;

    if (isArrayOfType(tsDeclList, ts.isClassDeclaration)) {
      renameType = "class";
    } else if (isArrayOfType(tsDeclList, ts.isFunctionDeclaration)) {
      renameType = "function";
    } else if (isArrayOfType(tsDeclList, ts.isMethodDeclaration)) {
      renameType = "method";
    } else {
      throw new BlueprintNodeError("Expected ClassDeclaration[] or FunctionDeclaration[] at input 0", this);
    }

    const transformer = ({ sourceFile, decl }: { sourceFile: ts.SourceFile; decl: ts.Declaration }) => {
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
        } else if (renameType === "method" && ts.isMethodDeclaration(node) && node.name) {
          const name = this.getNewName(node.name.getText(sourceFile), fullName, prefix, postfix);
          const nameIdentifier = ts.factory.createIdentifier(name);

          this.renameSymbol(sourceFile, node as unknown as ts.Identifier, nameIdentifier);

          return ts.factory.updateMethodDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            nameIdentifier,
            node.questionToken,
            node.typeParameters,
            node.parameters,
            node.type,
            node.body
          );
        }

        return ts.visitEachChild(node, visitor, undefined);
      };

      return ts.visitNode(decl, visitor);
    };

    return tsDeclList.map((x) => ({ sourceFile: x.getSourceFile(), decl: x })).map(transformer);
  }

  private renameSymbol(sourceFile: ts.SourceFile, node: NamedNode, newNode: ts.Identifier): void {
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
    const tsDeclList = await this.evalInput<ts.Node[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!tsDeclList) {
      return [];
    }

    if (isArrayOfType(tsDeclList, ts.isSourceFile)) {
      return tsDeclList.map((x) => this.getNewName(x.fileName, fullName, prefix, postfix));
    }

    return tsDeclList
      .filter((x) => !!(x as NamedNode).name)
      .map((x) => this.getNewName((x as NamedNode).name!.getText(), fullName, prefix, postfix));
  }
}
