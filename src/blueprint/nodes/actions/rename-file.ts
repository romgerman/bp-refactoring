import * as path from "path";
import ts from "typescript";
import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { isArrayOfType } from "../../helpers";

export class RenameFileActionNode extends BlueprintNode {
  readonly type: string = NodeTypes.RenameFileAction;

  async evaluate(): Promise<any> {
    const files = await this.evalInput<ts.SourceFile[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!files || !isArrayOfType(files, ts.isSourceFile)) {
      throw new Error("Expected input 0 to be SourceFile[]");
    }

    /*
      1. Find rename occurences
      2. Rename occurences
      3. Rename files
    */

    const changeTracker = this.compiler.changeTracker;
    const renameTracker = this.compiler.renameFileTracker;

    for (const rename of this.renameFiles(files, fullName, prefix, postfix)) {
      // This is very slow
      const edits = this.compiler.languageService?.services?.getEditsForFileRename(rename.oldName, rename.newName, {}, undefined);

      if (edits) {
        console.log(edits);
        for (const edit of edits) {
          for (const change of edit.textChanges) {
            changeTracker.replaceText({
              sourceFile: this.compiler.builderProgram?.getSourceFile(edit.fileName)!,
              span: change.span,
              newText: change.newText,
            });
          }
        }
      }

      renameTracker.renameFile(rename.oldName, rename.newName);
    }

    console.log(changeTracker);

    return files;
  }

  private getNewName(name: string, fullName?: string, prefix?: string, postfix?: string): string {
    if (fullName) {
      name = fullName;
    }

    if (prefix) {
      name = `${prefix}${name}`;
    }

    if (postfix) {
      name = `${name}${postfix}`;
    }

    return name;
  }

  private renameFiles(
    files: ts.SourceFile[],
    fullName?: string,
    prefix?: string,
    postfix?: string
  ): { oldName: string; newName: string }[] {
    const result: { oldName: string; newName: string }[] = [];

    for (const sf of files) {
      const filename = path.basename(sf.fileName, ".ts");
      const pathname = sf.fileName.substring(0, sf.fileName.length - (filename.length + 3));
      const newName = pathname + this.getNewName(filename, fullName, prefix, postfix) + ".ts";
      result.push({ oldName: sf.fileName, newName });
    }

    return result;
  }

  async getViewData(): Promise<any> {
    const files = await this.evalInput<ts.SourceFile[]>(0);
    const fullName = await this.evalInput<string>(1);
    const prefix = await this.evalInput<string>(2);
    const postfix = await this.evalInput<string>(3);

    if (!files || !isArrayOfType(files, ts.isSourceFile)) {
      return [];
    } else {
      const result: string[] = [];

      for (const sf of files) {
        const filename = path.basename(sf.fileName, ".ts");
        const pathname = sf.fileName.substring(0, sf.fileName.length - (filename.length + 3));
        const newName = pathname + this.getNewName(filename, fullName, prefix, postfix) + ".ts";
        result.push(newName);
      }

      return result;
    }
  }
}
