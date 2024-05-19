import { NodeTypes } from "../../../shared/node-types";
import { BlueprintNode } from "../../blueprint-node";
import { BlueprintNodeError } from "../../node-error";

export abstract class PredicateNode<T = any> extends BlueprintNode<T> {
  readonly type: string = "predicate";

  abstract evaluate(): Promise<Function>;
  abstract getViewData(): Promise<any>;
}

export class FilterByNode extends BlueprintNode {
  readonly type: string = NodeTypes.FilterBy;

  async evaluate(): Promise<any> {
    const array = this.getInput(0);
    const predicate = this.getInput(1);

    if (!array) {
      throw new BlueprintNodeError("Input array not specified for Filter By node", this);
    }

    if (!predicate) {
      return await array.evaluate();
    }

    if (!(predicate instanceof PredicateNode)) {
      throw new BlueprintNodeError("Predicate is not of type PredicateNode", this);
    }

    const predicateFn: Function = await predicate.evaluate();

    if (!(typeof predicateFn === "function")) {
      throw new BlueprintNodeError("Predicate is not a function", this);
    }

    return await predicateFn(await array.evaluate());
  }

  getViewData(): Promise<any> {
    return Promise.resolve();
  }
}
