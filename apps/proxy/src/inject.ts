import { pathMatches, type ConnectRule, type InjectionAction } from "@toki/shared";

export function applyInjections(
  headers: Headers,
  path: string,
  rules: ConnectRule[],
): number {
  let count = 0;
  for (const rule of rules) {
    if (!pathMatches(path, rule.pathPattern)) continue;
    for (const action of rule.actions) {
      if (action.type === "SetHeader") {
        headers.set(action.name, action.value);
        count++;
      } else if (action.type === "RemoveHeader") {
        headers.delete(action.name);
        count++;
      }
    }
  }
  return count;
}
