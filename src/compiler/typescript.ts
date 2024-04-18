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

  public readonly events = new EventEmitter<"ready">();

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
      this.events.emit("ready", true);
    };

    ts.createWatchProgram(host);
  }

  stop(): void {
    this._watchProgramConfig?.close();
    this._builderProgram = null;
    this._watchProgramConfig = null;
    this._ready = false;
    this.events.emit("ready", false);
  }

  emit(tsNodes: ts.Node[]): void {
    const printer = ts.createPrinter({});
    for (const node of tsNodes) {
      const text = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile());
      //console.log(text);
      // const text = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile());
      const newFile = node
        .getSourceFile()
        .update(text, ts.createTextChangeRange(ts.createTextSpanFromBounds(node.getStart(), node.getEnd()), text.length));
      console.log(printer.printFile(newFile));
    }

    // for (const file of this.builderProgram?.getSourceFiles() ?? []) {
    //   const text = printer.printFile(file);
    //   console.log(text);
    // }
  }
}
