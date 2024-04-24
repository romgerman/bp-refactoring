import "reflect-metadata";
import * as vscode from "vscode";
import { BlueprintWebPanel } from "./blueprint-web-panel";
import { ExtensionEventBus } from "./extension-event-bus";
import { TypescriptCompiler } from "../typescript/compiler";
import { sendEventCommand } from "./utils";
import { ApplyChangesComplete, GraphNodeSendViewData, TsCompilerStatusChanged } from "../shared/events";
import { GraphNodeAddedEventHandler } from "./events/graph-node-added";
import { GraphNodeRemovedEventHandler } from "./events/graph-node-removed";
import { BlueprintStore } from "../blueprint/store";
import { GraphNodeConnectedEventHandler } from "./events/graph-node-connected";
import { GraphNodeDisconnectedEventHandler } from "./events/graph-node-disconnected";
import { GraphNodeGetViewDataEventHandler } from "./events/graph-node-get-view-data";
import { GraphNodeUpdateStateEventHandler } from "./events/graph-node-update-state";
import { ApplyChangesEventHandler } from "./events/lifecycle-apply-changes";
import { SaveBlueprintEventHandler } from "./events/save-blueprint";
import { LoadBlueprintEventHandler } from "./events/load-blueprint";
import { GraphCleanEventHandler } from "./events/graph-clean";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bp-refactoring" is now active!');

  const compiler = new TypescriptCompiler();
  compiler.events
    .on("ready", (status: boolean) => {
      sendEventCommand<TsCompilerStatusChanged>(BlueprintWebPanel.currentPanel?.webview!, {
        command: "lifecycle:compiler:status",
        data: status,
      });
    })
    .on("emit-completed", () => {
      sendEventCommand<ApplyChangesComplete>(BlueprintWebPanel.currentPanel?.webview!, {
        command: "lifecycle:apply-complete",
      });
    });

  async function updateGraphViewData(targetId: string) {
    try {
      const data = await store.getViewData(targetId);
      for (let d of data) {
        sendEventCommand<GraphNodeSendViewData>(BlueprintWebPanel.currentPanel?.webview!, {
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
    .on("node-connected", async ({ targetId }: { targetId: string }) => {
      await updateGraphViewData(targetId);
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
    .addHandler(new SaveBlueprintEventHandler())
    .addHandler(new LoadBlueprintEventHandler());

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const openViewDisposable = vscode.commands.registerCommand("bp-refactoring.open-view", () => {
    BlueprintWebPanel.createOrShow(context.extensionUri, bus);
  });

  const groupNodesDisposable = vscode.commands.registerCommand("bp-refactoring.group-nodes", () => {
    console.log("ok");
  });

  const copyCommandDisposable = vscode.commands.registerCommand("editor.action.clipboardCopyAction", (e) => {
    console.log("copy!");
  });

  const pasteCommandDisposable = vscode.commands.registerCommand("editor.action.clipboardPasteAction", (e) => {
    console.log("paste!");
  });

  context.subscriptions.push(openViewDisposable, groupNodesDisposable, copyCommandDisposable, pasteCommandDisposable);
}

export function deactivate() {}
