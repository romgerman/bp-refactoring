import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";

export abstract class PredicateNode<T = any> extends BlueprintNode<T> {
  readonly type: string = "predicate";

  abstract evaluate(): Promise<Function>;
  abstract getViewData(): Promise<any>;
}

export class FilterByNode extends BlueprintNode {
  readonly type: string = NodeTypes.FilterBy;

  override async evaluate(): Promise<any> {
    const array = this.getInput(0);
    const predicate = this.getInput(1);

    if (!array) {
      throw new Error("Input array not specified for Filter By node");
    }

    if (!predicate) {
      return await array.evaluate();
    }

    if (!(predicate instanceof PredicateNode)) {
      throw new Error("Predicate is not of type PredicateNode");
    }

    const predicateFn: Function = await predicate.evaluate();

    if (!(typeof predicateFn === "function")) {
      throw new Error("Predicate is not a function");
    }

    return await predicateFn(await array.evaluate());
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
