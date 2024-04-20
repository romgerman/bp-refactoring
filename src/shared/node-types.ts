export enum NodeTypes {
  Project = "project",

  // Data
  Constant = "constant",

  // Aggregation
  ClassList = "class-list",
  FileList = "file-list",
  FunctionList = "function-list",

  // Filtering
  FilterBy = "filter-by",
  DecoratorPredicate = "has-decorator-predicate",

  // Actions
  RenameClassAction = "rename-class-action",
  DebugAction = "debug-action",
  ApplyAction = "apply-action",
}
