import "reflect-metadata";
import * as vscode from "vscode";
import { BlueprintWebPanel } from "./extension/blueprint-web-panel";
import { ExtensionEventBus } from "./extension/extension-event-bus";
import { TypescriptCompiler } from "./compiler/typescript";
import { sendEventCommand } from "./utils";
import { GraphNodeSendViewData, TsCompilerStatusChanged } from "./shared/events";
import { GraphNodeAddedEventHandler } from "./extension/events/graph-node-added";
import { GraphNodeRemovedEventHandler } from "./extension/events/graph-node-removed";
import { BlueprintStore } from "./blueprint/store";
import { GraphNodeConnectedEventHandler } from "./extension/events/graph-node-connected";
import { GraphNodeDisconnectedEventHandler } from "./extension/events/graph-node-disconnected";
import { GraphNodeGetViewDataEventHandler } from "./extension/events/graph-node-get-view-data";
import { BlueprintNode } from "./blueprint/blueprint-nodes";
import { GraphNodeUpdateStateEventHandler } from "./extension/events/graph-node-update-state";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bp-refactoring" is now active!');

  const compiler = new TypescriptCompiler();
  compiler.events.on("ready", (status: boolean) => {
    sendEventCommand<TsCompilerStatusChanged>(BlueprintWebPanel.currentPanel?.webview!, {
      command: "lifecycle:compiler:status",
      data: status,
    });
  });

  async function updateGraphViewData(targetId: string) {
    const data = await store.getViewData(targetId);
    for (let d of data) {
      sendEventCommand<GraphNodeSendViewData>(BlueprintWebPanel.currentPanel?.webview!, {
        command: "graph:node-send-view-data",
        data: { id: d.id, data: d.data },
      });
    }
  }

  const store = new BlueprintStore(compiler);
  store.events
    .on("node-removed", async ({ id }: { id: string }) => {
      try {
        // ...
      } catch (e) {
        console.warn(e);
      }
    })
    .on("node-connected", async ({ targetId }: { targetId: string }) => {
      try {
        await updateGraphViewData(targetId);
      } catch (e) {
        console.warn(e);
      }
    })
    .on("node-state-changed", async ({ id }: { id: string }) => {
      try {
        await updateGraphViewData(id);
      } catch (e) {
        console.warn(e);
      }
    });

  const bus = new ExtensionEventBus()
    .addHandler(new GraphNodeAddedEventHandler(store))
    .addHandler(new GraphNodeRemovedEventHandler(store))
    .addHandler(new GraphNodeConnectedEventHandler(store))
    .addHandler(new GraphNodeDisconnectedEventHandler(store))
    .addHandler(new GraphNodeGetViewDataEventHandler(store))
    .addHandler(new GraphNodeUpdateStateEventHandler(store));

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("bp-refactoring.open-view", () => {
    BlueprintWebPanel.createOrShow(context.extensionUri, bus);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
