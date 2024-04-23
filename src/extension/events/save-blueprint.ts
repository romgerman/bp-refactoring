import * as vscode from "vscode";
import { SaveBlueprint } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { writeFileSync } from "fs";

export class SaveBlueprintEventHandler implements IExtensionEventHandler<SaveBlueprint> {
  readonly command: "lifecycle:save" = "lifecycle:save";

  constructor() {}

  async handle(data: SaveBlueprint["data"], panel: vscode.WebviewPanel): Promise<void> {
    const saveUri = await vscode.window.showSaveDialog();

    if (saveUri) {
      writeFileSync(saveUri.fsPath, JSON.stringify(data?.data));
    }
  }
}
