import { BlueprintNode } from "./blueprint-node";

export class BlueprintNodeError extends Error {
  constructor(message: string, public readonly node: BlueprintNode) {
    super(message);
  }
}
