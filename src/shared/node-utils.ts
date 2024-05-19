import type { BlueprintNode } from "../blueprint/blueprint-node";

export type GetNodeStateType<T extends BlueprintNode<any>> = T extends BlueprintNode<infer R> ? R : unknown;
