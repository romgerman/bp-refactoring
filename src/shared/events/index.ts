import type { FlowExportObject } from "@vue-flow/core";
import { EventCommand } from "./event-command";

export interface ScanTsConfigs extends EventCommand<'scan:tsconfig'> {}
export interface TsConfigChanged extends EventCommand<'scan:tsconfig:selected', string> {}
export interface GetClassList extends EventCommand<'project:classlist'> {}
export interface ScanTsConfigsResult extends EventCommand<'scan:tsconfig', { value: string; label: string; }[]> {}
export interface TsCompilerStatusChanged extends EventCommand<'ts:compiler:status', boolean> {}
export interface UpdateAllNodes extends EventCommand<'lifecycle:update-all-nodes'> {}
export interface UpdateNodeGraph extends EventCommand<'lifecycle:update-node-graph', FlowExportObject> {}
