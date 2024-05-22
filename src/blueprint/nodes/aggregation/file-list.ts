import * as ts from "typescript";
import * as vscode from "vscode";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";
import { BlueprintNodeError } from "../../node-error";

export class FileListNode extends BlueprintNode<{ ignoreNodeModules: boolean }> {
  readonly type: string = NodeTypes.FileList;

  async evaluate(): Promise<ts.SourceFile[]> {
    const array = await this.evalInput<ts.Node[]>(0);

    if (!array) {
      throw new BlueprintNodeError("Expected Node[] at input 0.", this);
    }

    if (isArrayOfType(array, ts.isSourceFile)) {
      return this.filterNodeModules(array);
    }

    return this.filterNodeModules(array.map((n) => n.getSourceFile()));
  }

  private filterNodeModules(array: ts.SourceFile[]): ts.SourceFile[] {
    return array.filter((sf) => (this.state?.ignoreNodeModules ? !sf.fileName.includes("/node_modules") : true));
  }

  private getFileNames(array: ts.SourceFile[]): Array<{ path: string; name: string }> {
    return array
      .map((sourceFile) => {
        const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("file:///" + sourceFile.fileName));
        if (folder) {
          return {
            path: sourceFile.fileName,
            name: sourceFile.fileName.replace(folder.uri.path.slice(1), ""),
          };
        } else {
          return {
            path: sourceFile.fileName,
            name: sourceFile.fileName,
          };
        }
      })
      .filter((file) => (this.state?.ignoreNodeModules ? !file.name.startsWith("/node_modules") : true));
  }

  async getViewData(): Promise<Array<{ path: string; name: string }>> {
    const array = (await this.evalInput<ts.Node[]>(0)) || [];

    if (isArrayOfType(array, ts.isSourceFile)) {
      return this.getFileNames(array);
    }

    return this.getFileNames(array.map((n) => n.getSourceFile()));
  }
}
