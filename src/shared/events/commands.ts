import { EventCommand } from "./event-command";

export interface ApplyChanges extends EventCommand<"lifecycle:apply"> {}
export interface ApplyChangesComplete extends EventCommand<"lifecycle:apply-complete"> {}
export interface SaveBlueprint extends EventCommand<"lifecycle:save", { data: any }> {}
export interface LoadBlueprint extends EventCommand<"lifecycle:load", { data: any }> {}

export interface TsCompilerStatusChanged extends EventCommand<"lifecycle:compiler:status", boolean> {}

export interface GraphNodeAdded extends EventCommand<"graph:node-added", { id: string; type: string }> {}
export interface GraphNodeRemoved extends EventCommand<"graph:node-removed", { id: string }> {}
export interface GraphNodeConnected
  extends EventCommand<
    "graph:node-connected",
    { sourceId: string; targetId: string; sourceIndex: number; targetIndex: number }
  > {}
export interface GraphNodeDisconnected extends EventCommand<"graph:node-disconnected", { sourceId: string; targetId: string }> {}
export interface GraphNodeGetViewData extends EventCommand<"graph:node-get-view-data", { id: string }> {}
export interface GraphNodeSendViewData extends EventCommand<"graph:node-send-view-data", { id: string; data: any }> {}
export interface GraphNodeUpdateState extends EventCommand<"graph:node-update-state", { id: string; state: any }> {}
export interface GraphClean extends EventCommand<"graph:clean"> {}
export interface GraphAddNodesBatch extends EventCommand<"graph:add-nodes-batch", { nodes: { id: string; type: string }[] }> {}
export interface GraphConnectNodesBatch
  extends EventCommand<
    "graph:connect-nodes-batch",
    { nodes: { sourceId: string; targetId: string; sourceIndex: number; targetIndex: number }[] }
  > {}
