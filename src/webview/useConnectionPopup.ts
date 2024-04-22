import { useEventListener } from "@vueuse/core";

export function useConnectionPopup(open: (e: MouseEvent) => void, close: () => void) {
  useEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      close();
    }
  });

  useEventListener(
    "contextmenu",
    (e) => {
      e.stopImmediatePropagation();
      if (e.target instanceof HTMLElement && e.target.closest(".vue-flow__node")) {
        return;
      } else {
        open(e);
      }
    },
    { capture: true }
  );
}
