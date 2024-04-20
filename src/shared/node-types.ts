export enum NodeTypes {
  Project = "project",

  // Data
  Constant = "constant",

  // Aggregation
  ClassList = "class-list",
  FileList = "file-list",
  FunctionList = "function-list",
  MemberList = "member-list",

  // Filtering
  FilterBy = "filter-by",
  DecoratorPredicate = "has-decorator-predicate",

  // Actions
  RenameAction = "rename-action",
  DebugAction = "debug-action",
  ApplyAction = "apply-action",
}
