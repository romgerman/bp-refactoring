import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class MemberListNode extends BlueprintNode {
  readonly type: string = NodeTypes.MemberList;

  async evaluate(): Promise<any> {
    const list = (await this.evalInput<ts.ClassDeclaration[]>(0)) ?? [];

    if (!list || !isArrayOfType(list, ts.isClassDeclaration)) {
      throw new Error("Expected ClassDeclaration[] at input 0");
    }

    return list.flatMap((n) => n.members);
  }

  async getViewData(): Promise<any> {
    const list = (await this.evalInput<ts.ClassDeclaration[]>(0)) ?? [];

    if (!list || !isArrayOfType(list, ts.isClassDeclaration)) {
      return [];
    }

    return list.flatMap((n) => n.members).map((n) => n.name?.getText() + ` (${this.kindToString(n.kind)})`);
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
