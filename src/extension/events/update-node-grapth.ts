import * as vscode from "vscode";
import type { FlowExportObject } from "@vue-flow/core";
import { IExtensionEventHandler } from "../extension-event-bus";
import { UpdateNodeGraph } from "../../shared/events";
import { TypescriptCompiler } from "../../compiler/typescript";

export class UpdateNodeGraphEventHandler implements IExtensionEventHandler<UpdateNodeGraph> {
  readonly command: "lifecycle:update-node-graph" = "lifecycle:update-node-graph";

  constructor(private readonly compiler: TypescriptCompiler) {}

  handle(data: FlowExportObject | undefined, panel: vscode.WebviewPanel): void {

  }
}
