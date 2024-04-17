import * as vscode from "vscode";
import { IExtensionEventHandler } from "../../extension-event-bus";
import { GetClassList } from "../../../shared/events";
import { TypescriptCompiler } from "../../../compiler/typescript";
import { sendEventCommand } from "../../../utils";

export class ProjectClasslistEventHandler implements IExtensionEventHandler<GetClassList> {
  readonly command: "project:get-classlist" = "project:get-classlist";

  constructor(private readonly compiler: TypescriptCompiler) {}

  handle(data: string | undefined, panel: vscode.WebviewPanel): void {
    sendEventCommand<GetClassList>(panel.webview, {
      command: 'project:get-classlist',
      data: this.compiler.getAllClasses()
    });
  }
}
