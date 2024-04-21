import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class ConstantStringNode extends BlueprintNode<{ value: string }> {
  readonly type: string = NodeTypes.ConstantString;

  async evaluate(): Promise<any> {
    return this.state?.value;
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
