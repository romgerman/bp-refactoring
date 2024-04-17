import ts from "typescript";

export abstract class BlueprintNode<T, TPrev = any> {
  webViewNodeId: string | undefined;
  prev: BlueprintNode<TPrev> | null = null;
  next: BlueprintNode<any> | null = null;

  protected cachedResult: T | null = null;

  constructor(prevNode: BlueprintNode<any> | null) {
    this.prev = prevNode;
    if (prevNode) {
      prevNode.next = this;
    }
  }

  get result(): T | null {
    return this.cachedResult;
  }

  abstract evaluate(): T;
}

export class ProjectNode extends BlueprintNode<readonly ts.SourceFile[]> {
  constructor(program: ts.Program) {
    super(null);
    this.cachedResult = program.getSourceFiles();
  }

  override evaluate(): readonly ts.SourceFile[] {
    return this.cachedResult!;
  }
}

export class ClassListNode extends BlueprintNode<ts.ClassDeclaration[], readonly ts.SourceFile[]> {
  override evaluate(): ts.ClassDeclaration[] {
    this.cachedResult = this.prev!.evaluate()
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
    return this.cachedResult;
  }
}

export class FilterByDecorator extends BlueprintNode<ts.ClassDeclaration[], ts.ClassDeclaration[]> {
  constructor(prevNode: BlueprintNode<any>, private readonly decorators: string[]) {
    super(prevNode);
  }

  override evaluate(): ts.ClassDeclaration[] {
    return this.prev!.evaluate().filter((classDecl) => {
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
