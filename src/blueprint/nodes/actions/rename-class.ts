import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class RenameClassActionNode extends BlueprintNode<string> {
  readonly type: string = NodeTypes.RenameClassAction;

  async evaluate(): Promise<any> {
    const tsClassList: ts.ClassDeclaration[] = await this.evalInput(0);

    if (!Array.isArray(tsClassList) && !ts.isClassDeclaration(tsClassList[0])) {
      throw new Error("Expected ts.ClassDeclaration[]");
    }

    const result: ts.ClassDeclaration[] = [];

    for (let tsClass of tsClassList) {
      if (tsClass.name) {
        //const info = this.compiler.languageService?.services?.getRenameInfo(tsClass.getSourceFile().fileName, tsClass.name.getStart(), {});
        // const locs = this.compiler.languageService?.services?.findRenameLocations(
        //   tsClass.getSourceFile().fileName,
        //   tsClass.name.getStart(),
        //   false,
        //   false,
        //   {}
        // );
        (tsClass.name as any) = ts.factory.createIdentifier(this.state ?? tsClass.name?.getText() ?? "");
        result.push(tsClass);
      } else {
        result.push(tsClass);
      }
    }

    return result;
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
