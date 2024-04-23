import ts from "typescript";

export interface NamedNode extends ts.Node {
  name?: ts.Identifier;
}
