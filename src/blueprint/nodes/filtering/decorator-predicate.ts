import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { PredicateNode } from "./filter-by-node";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class DecoratorPredicateNode extends PredicateNode<{
  customName: string;
  selection: string;
}> {
  readonly type: string = NodeTypes.DecoratorPredicate;

  override async evaluate(): Promise<Function> {
    // const tsClassNodes: ts.ClassDeclaration[] = await this.getInput(0).evaluate();

    // if (!Array.isArray(tsClassNodes) && ts.isClassDeclaration(tsClassNodes[0])) {
    //   throw new Error("Invalid input on index 0. Expected type ts.ClassDeclaration[].");
    // }

    return async (tsClassNodes: ts.ClassDeclaration[]) => {
      const name = (await this.evalInput(0)) || this.state?.selection;
      return tsClassNodes.filter((classDecl) => {
        if (classDecl.modifiers) {
          const decorators = classDecl.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
          return decorators.find((dec) => {
            //const name = this.state?.customName || this.state?.selection;
            return name === ((dec.expression as ts.CallExpression).expression as ts.Identifier).getText();
          });
        } else {
          return false;
        }
      });
    };
  }

  async getViewData(): Promise<{
    customName: string | null;
    decoratorList: string[];
  }> {
    const customName: BlueprintNode = this.getInput(0);
    const tsClassNodes: ts.ClassDeclaration[] = await this.getInput(1)?.evaluate();

    if (!isArrayOfType(tsClassNodes, ts.isClassDeclaration)) {
      return {
        customName: customName ? await customName.evaluate() : null,
        decoratorList: [],
      };
    }

    const decoratorsSet = new Set<string>();
    for (const classDecl of tsClassNodes) {
      if (classDecl.modifiers) {
        const decorators = classDecl.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        decorators
          .map((x) => ((x.expression as ts.CallExpression).expression as ts.Identifier).getText())
          .forEach((d) => decoratorsSet.add(d));
      }
    }
    return {
      customName: await customName.evaluate(),
      decoratorList: Array.from(decoratorsSet.values()),
    };
  }
}
