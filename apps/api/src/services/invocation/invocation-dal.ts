import type { Invocation } from "@toki/core";

import type { AppStore } from "../../lib/store";

export const invocationDalFactory = (store: AppStore) => ({
  create(input: Omit<Invocation, "id">): Invocation {
    const invocation: Invocation = {
      id: crypto.randomUUID(),
      ...input
    };
    store.invocations.set(invocation.id, invocation);
    return invocation;
  }
});
