import * as ts from "typescript";
import * as vscode from "vscode";
import { TypescriptCompiler } from "../typescript/compiler";
import { NodeTypes } from "../shared/node-types";

function until(conditionFunction: Function): Promise<void> {
  const poll = (resolve: Function) => {
    if (conditionFunction()) {
      resolve();
    } else {
      setTimeout((_) => poll(resolve), 100);
    }
  };
  return new Promise(poll);
}

export abstract class BlueprintNode<S = any> {
  abstract readonly type: string;

  get hasInputs(): boolean {
    return this.inputs.length > 0;
  }

  get hasOutputs(): boolean {
    return this.outputs.length > 0;
  }

  inputs: BlueprintNode[] = [];
  outputs: BlueprintNode[] = [];
  state: S | null = null;

  constructor(protected readonly compiler: TypescriptCompiler) {}

  abstract evaluate(): Promise<any>;
  abstract getViewData(): Promise<any>;

  protected getInput(index: number): BlueprintNode {
    if (index < 0 || index >= this.inputs.length) {
      throw new Error("Invalid input index");
    }
    return this.inputs[index];
  }

  protected async evalInput<T = any>(index: number): Promise<T> {
    return await this.getInput(index).evaluate();
  }
}

export class ProjectNode extends BlueprintNode<string> {
  readonly type: string = NodeTypes.Project;

  override async evaluate() {
    if (!this.state) {
      throw new Error("No tsconfig selected");
    }
    this.compiler.start(this.state!);
    await until(() => this.compiler.isReady);

    return this.compiler.builderProgram?.getProgram().getSourceFiles();
  }

  async getViewData(): Promise<{ value: string; label: string }[]> {
    const allConfigFiles = await vscode.workspace.findFiles("**/tsconfig*.json", "**/node_modules/**", 100);

    if (allConfigFiles.length !== 0) {
      const folder = vscode.workspace.getWorkspaceFolder(allConfigFiles[0]);
      return allConfigFiles.map((x) => ({ value: x.toString(), label: x.path.replace(folder?.uri.path!, "") }));
    }

    return [];
  }
}

// Aggregation

export class ClassListNode extends BlueprintNode {
  readonly type: string = NodeTypes.ClassList;

  override async evaluate() {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (!tsFileList && ts.isSourceFile(tsFileList[0])) {
      throw new Error("Invalid input on index 0. Expected type ts.SourceFile[].");
    }

    return this.getClassList(tsFileList);
  }

  private getClassList(tsFileList: ts.SourceFile[]): ts.ClassDeclaration[] {
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

  async getViewData(): Promise<string[]> {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (!tsFileList && ts.isSourceFile(tsFileList[0])) {
      return [];
    }

    return this.getClassList(tsFileList)
      .map((x) => x.name?.getText())
      .filter((x) => x) as string[];
  }
}

export class FileListNode extends BlueprintNode {
  type: string = NodeTypes.FileList;

  async evaluate(): Promise<any> {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (!tsFileList && ts.isSourceFile(tsFileList[0])) {
      throw new Error("Invalid input at index 0. Expected type ts.SourceFile[].");
    }

    return tsFileList;
  }

  async getViewData(): Promise<any> {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (!tsFileList && ts.isSourceFile(tsFileList[0])) {
      return [];
    }

    return tsFileList.map((x) => x.fileName);
  }
}

// Filtering

export class FilterByNode extends BlueprintNode {
  readonly type: string = NodeTypes.FilterBy;

  async evaluate(): Promise<any> {
    const array = this.getInput(0);
    const predicate = this.getInput(1);

    if (!array) {
      throw new Error("Input array not specified for Filter By node");
    }

    if (!predicate) {
      throw new Error("Predicate not specified for Filter By node");
    }

    if (!(predicate instanceof PredicateNode)) {
      throw new Error("Predicate is not of type PredicateNode");
    }

    const predicateFn: Function = await predicate.evaluate();

    if (!(typeof predicateFn === "function")) {
      throw new Error("Predicate is not a function");
    }

    return predicateFn(await array.evaluate());
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}

// Predicates

export abstract class PredicateNode<T = any> extends BlueprintNode<T> {
  readonly type: string = "predicate";

  abstract evaluate(): Promise<Function>;
  abstract getViewData(): Promise<any>;
}

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

    console.log("name", this.state);
    return (tsClassNodes: ts.ClassDeclaration[]) => {
      return tsClassNodes.filter((classDecl) => {
        if (classDecl.modifiers) {
          const decorators = classDecl.modifiers.filter((mod) => mod.kind === ts.SyntaxKind.Decorator) as ts.Decorator[];
          return decorators.find((dec) => {
            const name = this.state?.customName || this.state?.selection;
            return name === ((dec.expression as ts.CallExpression).expression as ts.Identifier).getText();
          });
        } else {
          return false;
        }
      });
    };
  }

  async getViewData(): Promise<string[]> {
    const tsClassNodes: ts.ClassDeclaration[] = await this.getInput(0).evaluate();

    if (!tsClassNodes && ts.isClassDeclaration(tsClassNodes[0])) {
      return [];
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
    return Array.from(decoratorsSet.values());
  }
}

// Actions

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

export class DebugActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.DebugAction;

  async evaluate(): Promise<any> {
    console.log(await this.evalInput(0));
    return Promise.resolve();
  }

  async getViewData(): Promise<any> {
    console.log(await this.evalInput(0));
    return Promise.resolve();
  }
}

export class ApplyActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.ApplyAction;

  async evaluate(): Promise<any> {
    return await this.evalInput(0);
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
