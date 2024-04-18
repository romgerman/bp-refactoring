import * as ts from "typescript";

export class LanguageService {
  get services(): ts.LanguageService | null {
    return this._ls;
  }

  private _ls: ts.LanguageService | null = null;

  constructor() {}

  start(rootFileNames: string[], options: ts.CompilerOptions): void {
    const files: ts.MapLike<{ version: number }> = {};

    rootFileNames.forEach((fileName) => {
      files[fileName] = { version: 0 };
    });

    const serviceHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => rootFileNames,
      getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
      getScriptSnapshot: (fileName) => {
        if (!ts.sys.fileExists(fileName)) {
          return undefined;
        }

        return ts.ScriptSnapshot.fromString(ts.sys.readFile(fileName)!.toString());
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => options,
      getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    };

    this._ls = ts.createLanguageService(serviceHost, ts.createDocumentRegistry());
  }

  stop(): void {
    this._ls?.dispose();
  }
}
