import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

enum ConstantType {
  String = "string",
}

export class ConstantNode extends BlueprintNode<{ type: ConstantType; value: string }> {
  readonly type: string = NodeTypes.Constant;

  async evaluate(): Promise<any> {
    return this.convertValue(this.state?.value, this.state?.type);
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }

  private convertValue(value?: string, type?: string): any {
    switch (type) {
      case ConstantType.String:
        return value ?? "";
      default:
        return null;
    }
  }
}
