import * as vscode from "vscode";
import { ScanTsConfigs } from "../../shared/events";
import { IExtensionEventHandler } from "../extension-event-bus";
import { sendEventCommand } from "../../utils";

export class ScanTsConfigsEventHandler implements IExtensionEventHandler<ScanTsConfigs> {
  readonly command: "lifecycle:scan-tsconfigs" = "lifecycle:scan-tsconfigs";

  async handle(data: string | undefined, panel: vscode.WebviewPanel): Promise<void> {
    const allConfigFiles = await vscode.workspace.findFiles("**/tsconfig*.json", "**/node_modules/**", 100);

    if (allConfigFiles.length !== 0) {
      const folder = vscode.workspace.getWorkspaceFolder(allConfigFiles[0]);
      sendEventCommand<ScanTsConfigs>(panel.webview, {
        command: "lifecycle:scan-tsconfigs",
        data: allConfigFiles.map((x) => ({ value: x.toString(), label: x.path.replace(folder?.uri.path!, "") })),
      });
    }
  }
}
