import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";
import { BlueprintNodeError } from "../../node-error";
import { MemberType } from "./types";

export class MemberListNode extends BlueprintNode {
  readonly type: string = NodeTypes.MemberList;

  async evaluate(): Promise<any> {
    const array = await this.evalInput<ts.ClassDeclaration[]>(0);

    if (!array || !isArrayOfType(array, ts.isClassDeclaration)) {
      throw new BlueprintNodeError("Expected ClassDeclaration[] at input 0", this);
    }

    return array.flatMap((n) => n.members);
  }

  async getViewData(): Promise<{ name: string; type: string }[]> {
    const array = (await this.evalInput<ts.ClassDeclaration[]>(0)) ?? [];

    if (!array || !isArrayOfType(array, ts.isClassDeclaration)) {
      return [];
    }

    return array.flatMap((n) => n.members).map((n) => ({ name: n.name?.getText()!, type: this.kindToString(n.kind) }));
  }

  private kindToString(kind: ts.SyntaxKind): MemberType {
    switch (kind) {
      case ts.SyntaxKind.MethodDeclaration:
        return MemberType.Method;
      case ts.SyntaxKind.PropertyDeclaration:
        return MemberType.Property;
      case ts.SyntaxKind.Constructor:
        return MemberType.Constructor;
      case ts.SyntaxKind.GetAccessor:
        return MemberType.GetAccessor;
      case ts.SyntaxKind.SetAccessor:
        return MemberType.SetAccessor;
      default:
        return `unknown (${kind})` as any;
    }
  }
}
