import * as vscode from "vscode";
import { EditorOpenFile } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";

export class EditorOpenFileEventHandler implements IExtensionEventHandler<EditorOpenFile> {
  readonly command: "editor:open-file" = "editor:open-file";

  constructor() {}

  async handle(data: EditorOpenFile["data"], panel: vscode.WebviewPanel): Promise<void> {
    if (data?.path) {
      await vscode.window.showTextDocument(vscode.Uri.file(data.path));
    }
  }
}
