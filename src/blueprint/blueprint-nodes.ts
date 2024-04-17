import * as ts from "typescript";
import { TypescriptCompiler } from "../compiler/typescript";

export abstract class BlueprintNode {
  abstract readonly type: string;
  inputs: BlueprintNode[] = [];

  abstract evaluate(): any;

  getInput(index: number): any {
    if (index < 0 || index >= this.inputs.length) {
      throw new Error("Invalid input index");
    }
    return this.inputs[index];
  }
}

export class ProjectNode extends BlueprintNode {
  readonly type: string = "project";

  constructor(private readonly compiler: TypescriptCompiler) {
    super();
  }

  evaluate() {
    return this.compiler.builderProgram?.getProgram().getSourceFiles();
  }
}

export class ClassListNode extends BlueprintNode {
  readonly type: string = "class-list";

  evaluate() {
    const tsFileList: ts.SourceFile[] = this.getInput(0);

    if (!tsFileList && ts.isSourceFile(tsFileList[0])) {
      throw new Error("Invalid input on index 0. Expected type ts.SourceFile[].");
    }

    return tsFileList
      .flatMap((file) =>
        ts.forEachChild(file, (node) => {
          if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            return node;
          } else {
            return null;
          }
        })
      )
      .filter((x) => !!x) as ts.ClassDeclaration[];
  }
}

export class FilterByDecorator extends BlueprintNode {
  readonly type: string = "has-decorator";

  constructor(private readonly decorators: string[]) {
    super();
  }

  override evaluate(): ts.ClassDeclaration[] {
    const tsClassNodes: ts.ClassDeclaration[] = this.getInput(0);

    if (!tsClassNodes && ts.isClassDeclaration(tsClassNodes[0])) {
      throw new Error("Invalid input on index 0. Expected type ts.ClassDeclaration[].");
    }

    return tsClassNodes.filter((classDecl) => {
      if (classDecl.modifiers) {
        const decorators = classDecl.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
        return decorators.find((dec) =>
          this.decorators.includes(((dec.expression as ts.CallExpression).expression as ts.Identifier).getText())
        );
      } else {
        return false;
      }
    });
  }
}
