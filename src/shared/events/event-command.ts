export interface EventCommand<C extends string, T = any> {
  command: C;
  data?: T;
}
