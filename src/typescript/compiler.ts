import * as vscode from "vscode";
import ts from "typescript";
import EventEmitter from "eventemitter3";
import { LanguageService } from "./language-service";
import { ChangeTracker } from "./change-tracker";

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

  public get languageService(): LanguageService | null {
    return this._ls;
  }

  public get changeTracker(): ChangeTracker {
    return this._changeTracker;
  }

  public readonly events = new EventEmitter<"ready" | "file-changed" | "emit-completed">();

  private _changeTracker = new ChangeTracker();

  private _watchProgramConfig: ts.WatchOfConfigFile<ts.BuilderProgram> | null = null;
  private _builderProgram: ts.BuilderProgram | null = null;
  private _ready = false;

  private _ls: LanguageService | null = null;

  constructor() {
    super(() => this.stop());
  }

  start(configPath: string): void {
    this.stop();
    this._changeTracker = new ChangeTracker();

    const createProgram = ts.createAbstractBuilder;

    const host = ts.createWatchCompilerHost(
      vscode.Uri.parse(configPath).fsPath,
      undefined,
      ts.sys,
      createProgram,
      reportDiagnostic,
      reportWatchStatusChanged
    );
    host.afterProgramCreate = (program) => {
      this._builderProgram = program;
      this._ready = true;
      this._ls = new LanguageService();
      this._ls.start(
        program.getSourceFiles().map((x) => x.fileName),
        program.getCompilerOptions()
      );
      this.events.emit("ready", true);
    };
    host.onWatchStatusChange = () => {
      this.events.emit("file-changed");
    };

    ts.createWatchProgram(host);
  }

  stop(): void {
    this._ls?.stop();
    this._watchProgramConfig?.close();
    this._builderProgram = null;
    this._watchProgramConfig = null;
    this._ready = false;
    this.events.emit("ready", false);
  }

  emit(): void {
    this.changeTracker.appyChanges();
    this.events.emit("emit-completed");
  }

  printToFiles(tsNodes: ts.Node[]): void {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.CarriageReturnLineFeed,
      removeComments: false,
      omitTrailingSemicolon: true,
    });
    for (const file of tsNodes.map((x) => x.getSourceFile())) {
      const text = printer.printFile(file);
      ts.sys.writeFile(file.fileName, text);
    }
  }
}
