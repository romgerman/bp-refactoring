export enum NodeTypes {
  Project = "project",

  // Data
  Constant = "constant",

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
  ByRegExpPredicate = "by-regexp-predicate",
  ByGlobPredicate = "by-glob-predicate",
  ByModifierPredicate = "by-modifier-predicate",

  // Actions
  RenameAction = "rename-action",
  RenameFileAction = "rename-file-action",
  DebugAction = "debug-action",
  ApplyAction = "apply-action",
}
