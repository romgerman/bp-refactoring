import * as vscode from "vscode";
import ts from "typescript";
import EventEmitter from "eventemitter3";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  console.error("Error", diagnostic.code, ":", ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine()));
}

/**
 * Prints a diagnostic every time the watch status changes.
 * This is mainly for messages like "Starting compilation" or "Compilation completed".
 */
function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, formatHost));
}

export class TypescriptCompiler extends vscode.Disposable {
  public get isReady(): boolean {
    return this._ready;
  }

  public get builderProgram(): ts.BuilderProgram | null {
    return this._builderProgram;
  }

  public readonly events = new EventEmitter<'ready'>();

  private _watchProgramConfig: ts.WatchOfConfigFile<ts.BuilderProgram> | null = null;
  private _builderProgram: ts.BuilderProgram | null = null;
  private _ready = false;

  constructor() {
    super(() => this.stop());
  }

  start(configPath: string): void {
    this.stop();
    const createProgram = ts.createAbstractBuilder;

    const host = ts.createWatchCompilerHost(
      vscode.Uri.parse(configPath).fsPath,
      {},
      ts.sys,
      createProgram,
      reportDiagnostic,
      reportWatchStatusChanged
    );
    host.afterProgramCreate = (program) => {
      this._builderProgram = program;
      this._ready = true;
      this.events.emit('ready', true);
    };

    ts.createWatchProgram(host);
  }

  stop(): void {
    this._watchProgramConfig?.close();
    this._builderProgram = null;
    this._watchProgramConfig = null;
    this._ready = false;
    this.events.emit('ready', false);
  }

  getAllClasses(): string[] {
    if (!this._builderProgram) {
      return [];
    }

    return this._builderProgram!.getProgram()
      .getSourceFiles()
      .map((sourceFile) =>
        ts.forEachChild(sourceFile, (node) => {
          if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            const classDecl = node as ts.ClassDeclaration;
            let mods = "";

            if (classDecl.modifiers) {
              for (const mod of classDecl.modifiers) {
                if (mod.kind === ts.SyntaxKind.Decorator) {
                  const dec = mod as ts.Decorator;
                  mods += ((dec.expression as ts.CallExpression).expression as ts.Identifier).getText() + ";";
                }
              }
            }

            return classDecl.name?.getText() + `(${mods})`;
          } else {
            return null;
          }
        })
      )
      .flat()
      .filter((x) => !!x) as string[];
  }
}
