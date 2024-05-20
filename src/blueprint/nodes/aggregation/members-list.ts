import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";
import { BlueprintNodeError } from "../../node-error";

export class MemberListNode extends BlueprintNode {
  readonly type: string = NodeTypes.MemberList;

  async evaluate(): Promise<any> {
    const array = await this.evalInput<ts.ClassDeclaration[]>(0);

    if (!array || !isArrayOfType(array, ts.isClassDeclaration)) {
      throw new BlueprintNodeError("Expected ClassDeclaration[] at input 0", this);
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
      case ts.SyntaxKind.PropertyDeclaration:
        return "property";
      default:
        return "unknown";
    }
  }
}
