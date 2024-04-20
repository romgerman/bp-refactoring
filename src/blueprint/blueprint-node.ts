import { TypescriptCompiler } from "../typescript/compiler";

export abstract class BlueprintNode<S = any> {
  abstract readonly type: string;

  get hasInputs(): boolean {
    return this.inputs.length > 0;
  }

  get hasOutputs(): boolean {
    return this.outputs.length > 0;
  }

  inputs: BlueprintNode[] = [];
  outputs: BlueprintNode[] = [];
  state: S | null = null;

  constructor(protected readonly compiler: TypescriptCompiler) {}

  abstract evaluate(): Promise<any>;
  abstract getViewData(): Promise<any>;

  protected getInput(index: number): BlueprintNode {
    if (index < 0 || index >= this.inputs.length) {
      console.warn("Invalid input index");
    }
    return this.inputs[index];
  }

  protected async evalInput<T = any>(index: number): Promise<T> {
    return await this.getInput(index).evaluate();
  }
}
