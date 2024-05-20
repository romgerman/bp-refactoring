import { ref, watch, toRaw } from "vue";
import { useNode, useVueFlow } from "@vue-flow/core";
import { sendEventCommand } from "../../webview/event-utils";
import { GraphNodeUpdateState } from "../../shared/events";
import type { BlueprintNode } from "../../blueprint/blueprint-node";
import type { GetNodeStateType } from "../../shared/node-utils";

export function useNodeState<T extends BlueprintNode>(initialState: GetNodeStateType<T>) {
  const { node, id: nodeId } = useNode();
  const model = ref<GetNodeStateType<T>>(initialState);
  const { onNodesInitialized } = useVueFlow();

  onNodesInitialized(() => {
    if (Object.keys(node.data).length > 0) {
      model.value = toRaw(node.data);
    }
  });

  watch(
    model,
    (value) => {
      sendEventCommand<GraphNodeUpdateState>({
        command: "graph:node-update-state",
        data: {
          id: nodeId,
          state: (node.data = toRaw(value)),
        },
      });
    },
    { deep: true }
  );

  return model;
}
