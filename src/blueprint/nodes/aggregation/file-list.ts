import * as ts from "typescript";
import * as vscode from "vscode";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class FileListNode extends BlueprintNode {
  type: string = NodeTypes.FileList;

  async evaluate(): Promise<any> {
    const tsFileList = await this.evalInput<ts.SourceFile[]>(0);

    if (!tsFileList) {
      throw new Error("Expected SourceFile[] at input 0");
    }

    if (isArrayOfType(tsFileList, ts.isSourceFile)) {
      return tsFileList;
    }

    return tsFileList;
  }

  async getViewData(): Promise<string[]> {
    const tsFileList = (await this.evalInput<ts.SourceFile[]>(0)) || [];

    if (isArrayOfType(tsFileList, ts.isSourceFile)) {
      tsFileList.map((sourceFile) => {
        const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("file:///" + sourceFile.fileName));
        if (folder) {
          return sourceFile.fileName.replace(folder.uri.path.slice(1), "");
        } else {
          return sourceFile.fileName;
        }
      });
    }

    return tsFileList.map((x) => {
      const sourceFile = x.getSourceFile();
      const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("file:///" + sourceFile.fileName));
      if (folder) {
        return sourceFile.fileName.replace(folder.uri.path.slice(1), "");
      } else {
        return sourceFile.fileName;
      }
    });
  }
}
