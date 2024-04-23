import * as vscode from "vscode";
import { LoadBlueprint } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { readFileSync } from "fs";

export class LoadBlueprintEventHandler implements IExtensionEventHandler<LoadBlueprint> {
  readonly command: "lifecycle:load" = "lifecycle:load";

  constructor() {}

  async handle(data: LoadBlueprint["data"], panel: vscode.WebviewPanel): Promise<object | void> {
    const openUri = await vscode.window.showOpenDialog({
      filters: {
        "Blueprint Files": ["blueprint.json"],
      },
      canSelectMany: false,
    });

    if (openUri) {
      const rawJson = readFileSync(openUri[0].fsPath);
      return { data: rawJson.toString() };
    }
  }
}
