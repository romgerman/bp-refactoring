import { GraphNodeSendViewData } from "@/shared/events";
import { useEventCommandResult } from "../event-utils";
import { useNode } from "@vue-flow/core";

/** Helper for retrieving node view data */
export function useViewData<T>(callback: (data: T) => void) {
  const { id } = useNode();
  useEventCommandResult<GraphNodeSendViewData, { id: string; data: T }>("graph:node-send-view-data", (data) => {
    if (id === data.id) {
      callback(data.data);
    }
  });
}
