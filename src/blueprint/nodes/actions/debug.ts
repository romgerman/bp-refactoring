import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class DebugActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.DebugAction;

  async evaluate(): Promise<any> {
    console.log(await this.evalInput(0));
    return Promise.resolve();
  }

  async getViewData(): Promise<any> {
    console.log(await this.evalInput(0));
    return Promise.resolve();
  }
}
