import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class MemberListNode extends BlueprintNode {
  readonly type: string = NodeTypes.MemberList;

  async evaluate(): Promise<any> {
    const array = await this.evalInput<ts.ClassDeclaration[]>(0);

    if (!array || !isArrayOfType(array, ts.isClassDeclaration)) {
      throw new Error("Expected ClassDeclaration[] at input 0");
    }

    return array.flatMap((n) => n.members);
  }

  async getViewData(): Promise<any> {
    const array = (await this.evalInput<ts.ClassDeclaration[]>(0)) ?? [];

    if (!array || !isArrayOfType(array, ts.isClassDeclaration)) {
      return [];
    }

    return array.flatMap((n) => n.members).map((n) => n.name?.getText() + ` (${this.kindToString(n.kind)})`);
  }

  private kindToString(kind: ts.SyntaxKind): string {
    switch (kind) {
      case ts.SyntaxKind.MethodDeclaration:
        return "method";
      default:
        return "unknown";
    }
  }
}
