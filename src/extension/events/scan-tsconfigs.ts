import * as vscode from "vscode";
import { ScanTsConfigs, ScanTsConfigsResult } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { sendEventCommand } from "../../utils";

export class ScanTsConfigsEventHandler implements IExtensionEventHandler<ScanTsConfigs> {
  readonly command: "scan:tsconfig" = "scan:tsconfig";

  async handle(data: string | undefined, panel: vscode.WebviewPanel): Promise<void> {
    const allConfigFiles = await vscode.workspace.findFiles("**/tsconfig*.json", "**/node_modules/**", 100);

    if (allConfigFiles.length !== 0) {
      const folder = vscode.workspace.getWorkspaceFolder(allConfigFiles[0]);
      sendEventCommand<ScanTsConfigsResult>(panel.webview, {
        command: "scan:tsconfig",
        data: allConfigFiles.map((x) => ({ value: x.toString(), label: x.path.replace(folder?.uri.path!, "") })),
      });
    }
  }
}
