import type { FlowExportObject } from "@vue-flow/core";
import { EventCommand } from "./event-command";

export interface ScanTsConfigs extends EventCommand<'lifecycle:scan-tsconfigs'> {}
export interface UpdateAllNodes extends EventCommand<'lifecycle:update-all-nodes'> {}
export interface UpdateNodeGraph extends EventCommand<'lifecycle:update-node-graph', FlowExportObject> {}

export interface TsConfigChanged extends EventCommand<'project:tsconfig-selected', string> {}
export interface GetClassList extends EventCommand<'project:get-classlist'> {}

export interface TsCompilerStatusChanged extends EventCommand<'lifecycle:compiler:status', boolean> {}
