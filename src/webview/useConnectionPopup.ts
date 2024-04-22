import { OnConnectStartParams, useVueFlow } from "@vue-flow/core";
import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

export function useConnectionPopup(open: (e: MouseEvent, params: OnConnectStartParams) => void, close: () => void) {
  const { onConnectStart, onConnectEnd } = useVueFlow();
  const connectParams = ref<OnConnectStartParams>();

  onConnectStart((e) => {
    connectParams.value = e;
  });

  useEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      close();
    }
  });

  onConnectEnd((e) => {
    open(e as MouseEvent, connectParams.value);
  });
}
