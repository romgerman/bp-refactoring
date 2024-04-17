import * as vscode from "vscode";
import { TsConfigChanged } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { TypescriptCompiler } from "../../compiler/typescript";

export class TsConfigChangedEventHandler implements IExtensionEventHandler<TsConfigChanged> {
  readonly command: "scan:tsconfig:selected" = "scan:tsconfig:selected";

  constructor(private readonly compiler: TypescriptCompiler) {}

  handle(data: string | undefined, panel: vscode.WebviewPanel): void {
    if (data) {
      this.compiler.start(data);
    }
  }
}
