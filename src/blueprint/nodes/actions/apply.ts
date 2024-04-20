import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class ApplyActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.ApplyAction;

  async evaluate(): Promise<any> {
    return await this.evalInput(0);
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
