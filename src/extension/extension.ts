import "reflect-metadata";
import * as vscode from "vscode";
import { BlueprintWebPanel } from "./blueprint-web-panel";
import { ExtensionEventBus } from "./extension-event-bus";
import { TypescriptCompiler } from "../typescript/compiler";
import { ApplyChangesComplete, GraphNodeSendViewData, TsCompilerStatusChanged } from "../shared/events";
import {
  GraphNodeAddedEventHandler,
  GraphNodeRemovedEventHandler,
  GraphNodeConnectedEventHandler,
  GraphNodeDisconnectedEventHandler,
  GraphNodeGetViewDataEventHandler,
  GraphNodeUpdateStateEventHandler,
  ApplyChangesEventHandler,
  SaveBlueprintEventHandler,
  LoadBlueprintEventHandler,
  GraphCleanEventHandler,
  GraphNodeAddNodesBatchEventHandler,
} from "./events";
import { BlueprintStore } from "../blueprint/store";
import { EventManager } from "./event-manager";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bp-refactoring" is now active!');

  const compiler = new TypescriptCompiler();
  compiler.events
    .on("ready", (status: boolean) => {
      EventManager.sendEventCommand<TsCompilerStatusChanged>(BlueprintWebPanel.currentPanel?.webview!, {
        command: "lifecycle:compiler:status",
        data: status,
      });
    })
    .on("emit-completed", () => {
      EventManager.sendEventCommand<ApplyChangesComplete>(BlueprintWebPanel.currentPanel?.webview!, {
        command: "lifecycle:apply-complete",
      });
    });

  async function updateGraphViewData(targetId: string) {
    try {
      const data = await store.getViewData(targetId);
      for (let d of data) {
        EventManager.sendEventCommand<GraphNodeSendViewData>(BlueprintWebPanel.currentPanel?.webview!, {
          command: "graph:node-send-view-data",
          data: { id: d.id, data: d.data },
        });
      }
    } catch (e: any) {
      console.warn(e.message);
    }
  }

  const store = new BlueprintStore(compiler);
  store.events
    .on("node-added", async ({ id }: { id: string }) => {
      await updateGraphViewData(id);
    })
    .on("node-connected", async ({ targetId, sourceId }: { targetId: string; sourceId: string }) => {
      await updateGraphViewData(sourceId);
    })
    .on("node-disconnected", async ({ targetId }: { targetId: string }) => {
      await updateGraphViewData(targetId);
    })
    .on("node-state-changed", async ({ id }: { id: string }) => {
      await updateGraphViewData(id);
    });

  const bus = new ExtensionEventBus()
    .addHandler(new GraphNodeAddedEventHandler(store))
    .addHandler(new GraphNodeRemovedEventHandler(store))
    .addHandler(new GraphNodeConnectedEventHandler(store))
    .addHandler(new GraphNodeDisconnectedEventHandler(store))
    .addHandler(new GraphNodeGetViewDataEventHandler(store))
    .addHandler(new GraphNodeUpdateStateEventHandler(store))
    .addHandler(new ApplyChangesEventHandler(store, compiler))
    .addHandler(new GraphCleanEventHandler(store))
    .addHandler(new GraphNodeAddNodesBatchEventHandler(store))
    .addHandler(new SaveBlueprintEventHandler())
    .addHandler(new LoadBlueprintEventHandler());

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const openView = vscode.commands.registerCommand("bp-refactoring.open-view", () => {
    BlueprintWebPanel.createOrShow(context.extensionUri, bus);
  });

  const groupNodes = vscode.commands.registerCommand("bp-refactoring.group-nodes", () => {
    console.log("ok");
  });

  const copyCommand = vscode.commands.registerCommand("editor.action.clipboardCopyAction", (e) => {
    console.log("copy!");
  });

  const pasteCommand = vscode.commands.registerCommand("editor.action.clipboardPasteAction", (e) => {
    console.log("paste!");
  });

  context.subscriptions.push(openView, groupNodes, copyCommand, pasteCommand);
}

export function deactivate() {}
