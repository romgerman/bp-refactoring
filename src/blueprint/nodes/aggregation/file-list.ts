import * as ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class FileListNode extends BlueprintNode {
  type: string = NodeTypes.FileList;

  async evaluate(): Promise<any> {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (isArrayOfType(tsFileList, ts.isSourceFile)) {
      return tsFileList;
    }

    return tsFileList;
  }

  async getViewData(): Promise<any> {
    const tsFileList: ts.SourceFile[] = await this.evalInput(0);

    if (isArrayOfType(tsFileList, ts.isSourceFile)) {
      return tsFileList.map((x) => x.fileName);
    }

    return tsFileList.map((x) => x.getSourceFile().fileName);
  }
}
