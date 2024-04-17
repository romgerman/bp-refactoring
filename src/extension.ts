import "reflect-metadata";
import * as vscode from "vscode";
import { BlueprintWebPanel } from "./extension/blueprint-web-panel";
import { ExtensionEventBus } from "./extension/extension-event-bus";
import { TsConfigChangedEventHandler, ScanTsConfigsEventHandler, UpdateNodeGraphEventHandler } from "./extension/events";
import { TypescriptCompiler } from "./compiler/typescript";
import { sendEventCommand } from "./utils";
import { ProjectClasslistEventHandler } from "./extension/events/project/project-classlist";
import { TsCompilerStatusChanged, UpdateAllNodes } from "./shared/events";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bp-refactoring" is now active!');

  const compiler = new TypescriptCompiler();
  compiler.events.on("ready", (status: boolean) => {
    sendEventCommand<TsCompilerStatusChanged>(BlueprintWebPanel.currentPanel?.webview!, {
      command: "lifecycle:compiler:status",
      data: status,
    });
    sendEventCommand<UpdateAllNodes>(BlueprintWebPanel.currentPanel?.webview!, {
      command: "lifecycle:update-all-nodes",
    });
  });

  const bus = new ExtensionEventBus()
    .addHandler(new TsConfigChangedEventHandler(compiler))
    .addHandler(new ScanTsConfigsEventHandler())
    .addHandler(new ProjectClasslistEventHandler(compiler))
    .addHandler(new UpdateNodeGraphEventHandler(compiler));

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("bp-refactoring.open-view", () => {
    BlueprintWebPanel.createOrShow(context.extensionUri, bus);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
