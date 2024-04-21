export enum NodeTypes {
  Project = "project",

  // Data
  Constant = "constant",
  RegExp = "regexp",

  // Aggregation
  ClassList = "class-list",
  FileList = "file-list",
  FunctionList = "function-list",
  MemberList = "member-list",
  Preview = "preview",

  // Filtering
  FilterBy = "filter-by",
  DecoratorPredicate = "has-decorator-predicate",
  OfTypePredicate = "of-type-predicate",
  ByNamePredicate = "by-name-predicate",

  // Actions
  RenameAction = "rename-action",
  DebugAction = "debug-action",
  ApplyAction = "apply-action",
}
