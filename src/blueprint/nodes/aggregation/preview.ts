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
    const array = await this.evalInput<ts.Node[]>(0);

    if (!Array.isArray(array)) {
      return [];
    } else {
      if (isArrayOfType(array, ts.isSourceFile)) {
        return array.map((n) => (n as ts.SourceFile).fileName);
      }
      return array
        .filter((n) => (n as { name?: ts.Identifier }).name)
        .map((n) => (n as { name?: ts.Identifier }).name?.getText());
    }
  }
}
