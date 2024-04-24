import * as ts from "typescript";
import * as vscode from "vscode";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class FileListNode extends BlueprintNode {
  readonly type: string = NodeTypes.FileList;

  async evaluate(): Promise<ts.SourceFile[]> {
    const array = await this.evalInput<ts.Node[]>(0);

    if (!array) {
      throw new Error("Expected Node[] at input 0.");
    }

    if (isArrayOfType(array, ts.isSourceFile)) {
      return array;
    }

    return array.map((n) => n.getSourceFile());
  }

  private getFileNames(array: ts.SourceFile[]): string[] {
    return array.map((sourceFile) => {
      const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("file:///" + sourceFile.fileName));
      if (folder) {
        return sourceFile.fileName.replace(folder.uri.path.slice(1), "");
      } else {
        return sourceFile.fileName;
      }
    });
  }

  async getViewData(): Promise<string[]> {
    const array = (await this.evalInput<ts.Node[]>(0)) || [];

    if (isArrayOfType(array, ts.isSourceFile)) {
      return this.getFileNames(array);
    }

    return this.getFileNames(array.map((n) => n.getSourceFile()));
  }
}
