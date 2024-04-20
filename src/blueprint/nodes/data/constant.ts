import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export class ConstantNode extends BlueprintNode<{ type: string; value: string }> {
  readonly type: string = NodeTypes.Constant;

  async evaluate(): Promise<any> {
    return this.convertValue(this.state?.value, this.state?.type);
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }

  private convertValue(value?: string, type?: string): any {
    if (type === "string") {
      return value ?? "";
    } else {
      return null;
    }
  }
}
