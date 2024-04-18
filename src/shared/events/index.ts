import type { FlowExportObject } from "@vue-flow/core";
import { EventCommand } from "./event-command";

export interface ScanTsConfigs extends EventCommand<"lifecycle:scan-tsconfigs"> {}
export interface UpdateAllNodes extends EventCommand<"lifecycle:update-all-nodes"> {}
export interface UpdateNodeGraph extends EventCommand<"lifecycle:update-node-graph", FlowExportObject> {}

export interface TsCompilerStatusChanged extends EventCommand<"lifecycle:compiler:status", boolean> {}

export interface GraphNodeAdded extends EventCommand<"graph:node-added", { id: string; type: string }> {}
export interface GraphNodeRemoved extends EventCommand<"graph:node-removed", { id: string }> {}
export interface GraphNodeConnected extends EventCommand<"graph:node-connected", { sourceId: string; targetId: string }> {}
export interface GraphNodeDisconnected extends EventCommand<"graph:node-disconnected", { sourceId: string; targetId: string }> {}
export interface GraphNodeGetViewData extends EventCommand<"graph:node-get-view-data", { id: string }> {}
export interface GraphNodeSendViewData extends EventCommand<"graph:node-send-view-data", { id: string; data: any }> {}
export interface GraphNodeUpdateState extends EventCommand<"graph:node-update-state", { id: string; state: any }> {}
