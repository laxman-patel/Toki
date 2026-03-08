import type { Invocation } from "@toki/core";

import type { AppContext } from "../../lib/app-context";

export const invocationDal = {
  create(context: AppContext, input: Omit<Invocation, "id">): Invocation {
    const invocation: Invocation = {
      id: crypto.randomUUID(),
      ...input
    };
    context.store.invocations.set(invocation.id, invocation);
    return invocation;
  }
};
