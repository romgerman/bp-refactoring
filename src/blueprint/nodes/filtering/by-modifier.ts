import ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { isArrayOfType } from "../../helpers";
import { BlueprintNodeError } from "../../node-error";
import { PredicateNode } from "./filter-by-node";
import { ByModifierType } from "./types";

export class ByModifierPredicateNode extends PredicateNode<{ type: ByModifierType }> {
  readonly type: string = NodeTypes.ByModifierPredicate;

  async evaluate(): Promise<Function> {
    return (array: ts.Node[]) => {
      if (this.state?.type === undefined) {
        throw new BlueprintNodeError("Expected type of modifier to be provided", this);
      }

      if (isArrayOfType(array, ts.isSourceFile)) {
        return [];
      }

      return this.getNodeWithModifier(array);
    };
  }

  private getNodeWithModifier(array: ts.Node[]) {
    if (isArrayOfType(array, ts.canHaveModifiers)) {
      switch (this.state?.type) {
        case ByModifierType.Public:
          return this.filterNodes(array, ts.SyntaxKind.PublicKeyword);
        case ByModifierType.Private:
          return this.filterNodes(array, ts.SyntaxKind.PrivateKeyword);
        case ByModifierType.Protected:
          return this.filterNodes(array, ts.SyntaxKind.ProtectedKeyword);
        case ByModifierType.Static:
          return this.filterNodes(array, ts.SyntaxKind.StaticKeyword);
        case ByModifierType.Abstract:
          return this.filterNodes(array, ts.SyntaxKind.AbstractKeyword);
        case ByModifierType.Export:
          return this.filterNodes(array, ts.SyntaxKind.ExportKeyword);
      }
    }
    return array;
  }

  private filterNodes(array: ts.HasModifiers[], kind: ts.SyntaxKind): ts.Node[] {
    const result: ts.Node[] = [];

    for (const node of array) {
      if (node.modifiers && node.modifiers.find((m) => m.kind === kind)) {
        result.push(node);
      }
    }

    return result;
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
