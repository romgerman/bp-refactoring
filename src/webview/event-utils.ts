import { useEventListener } from "@vueuse/core";
import { EventCommand } from "../shared/events/event-command";

/** Sends an event to extension host */
export function sendEventCommand<T extends EventCommand<any, any>>(command: T): void {
  window.vscode.postMessage(command);
}

/** Subscribe to events */
export function useEventCommandResult<T extends EventCommand<any, any>, R = any>(
  command: T["command"],
  callback: (data: R) => void
) {
  return useEventListener("message", ({ data }) => {
    if (data.command === command) {
      callback(data.data);
    }
  });
}

/** Subscribes to events until there is a result, then unsubscribes */
export function useEventCommandResultOnce<T extends EventCommand<any, any>>(
  command: T["command"],
  callback: (data: T["data"]) => void
): void {
  const unsub = useEventListener("message", ({ data }) => {
    if (data.command === command) {
      callback(data.data);
      unsub();
    }
  });
}

/** Sends an event and waits for result in callback */
export function sendEventCommandAndWaitResult<T extends EventCommand<any, any>, R = any>(
  command: T,
  callback: (data: R) => void
) {
  const unsub = useEventCommandResult<T>(command["command"], (data) => {
    callback(data);
    unsub();
  });
  sendEventCommand(command);
}

/** Wait for command in promise form */
export async function waitForEventAsync<T extends EventCommand<any, any>>(
  command: T["command"],
  predicate?: (data: T["data"]) => boolean
): Promise<void> {
  return new Promise((resolve) => {
    useEventCommandResultOnce(command, (data) => {
      if (predicate) {
        if (predicate(data)) {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}
