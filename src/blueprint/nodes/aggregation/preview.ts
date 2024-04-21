import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class PreviewNode extends BlueprintNode {
  readonly type: string = NodeTypes.Preview;

  async evaluate(): Promise<any> {
    return await this.evalInput(0);
  }

  async getViewData(): Promise<any> {
    const data = await this.evalInput<ts.Node[]>(0);

    if (Array.isArray(data)) {
      if (isArrayOfType(data, ts.isSourceFile)) {
        return data.map((n) => (n as ts.SourceFile).fileName);
      }
      return data.filter((n) => (n as { name?: ts.Identifier }).name).map((n) => (n as { name?: ts.Identifier }).name?.getText());
    } else {
      return [];
    }
  }
}
