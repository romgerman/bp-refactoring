import { NodeTypes } from "../shared/node-types";

export const NODES = [
  { group: true, name: "Data" },
  { type: NodeTypes.Constant, name: "Constant" },
  { group: true, name: "Aggregation" },
  { type: NodeTypes.ClassList, name: "Class List" },
  { type: NodeTypes.FileList, name: "File List" },
  { type: NodeTypes.FunctionList, name: "Function List" },
  { type: NodeTypes.MemberList, name: "Member List" },
  { type: NodeTypes.Preview, name: "Preview" },
  { group: true, name: "Filtering" },
  { type: NodeTypes.FilterBy, name: "Filter By" },
  { type: NodeTypes.DecoratorPredicate, name: "Has Decorator" },
  { type: NodeTypes.OfTypePredicate, name: "Of Type" },
  { type: NodeTypes.ByRegExpPredicate, name: "Regular Expression" },
  { type: NodeTypes.ByGlobPredicate, name: "Glob Pattern" },
  { group: true, name: "Actions" },
  { type: NodeTypes.RenameAction, name: "Rename" },
  { type: NodeTypes.DebugAction, name: "Debug" },
  { type: NodeTypes.ApplyAction, name: "Apply Changes" },
  { group: true, name: "Helpers" },
  { type: NodeTypes.Group, name: "Group" },
];
