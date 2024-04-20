import * as vscode from "vscode";
import { NodeTypes } from "../../shared/node-types";
import { BlueprintNode } from "../blueprint-node";

function until(conditionFunction: Function): Promise<void> {
  const poll = (resolve: Function) => {
    if (conditionFunction()) {
      resolve();
    } else {
      setTimeout((_) => poll(resolve), 100);
    }
  };
  return new Promise(poll);
}

export class ProjectNode extends BlueprintNode<string> {
  readonly type: string = NodeTypes.Project;

  override async evaluate() {
    if (!this.state) {
      throw new Error("No tsconfig selected");
    }
    this.compiler.start(this.state!);
    await until(() => this.compiler.isReady);

    return this.compiler.builderProgram?.getProgram().getSourceFiles();
  }

  async getViewData(): Promise<{ value: string; label: string }[]> {
    const allConfigFiles = await vscode.workspace.findFiles("**/tsconfig*.json", "**/node_modules/**", 100);

    if (allConfigFiles.length !== 0) {
      const folder = vscode.workspace.getWorkspaceFolder(allConfigFiles[0]);
      return allConfigFiles.map((x) => ({ value: x.toString(), label: x.path.replace(folder?.uri.path!, "") }));
    }

    return [];
  }
}
