import { ref, watch, toRaw } from "vue";
import { useNode, useVueFlow } from "@vue-flow/core";
import { sendEventCommand } from "../../webview/event-utils";
import { GraphNodeUpdateState } from "../../shared/events";

export function useNodeState<T>(initialState: T) {
  const { node, id: nodeId } = useNode();
  const model = ref<T>(initialState);
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
