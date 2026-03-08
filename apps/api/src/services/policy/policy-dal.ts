import type { PolicyRule } from "@toki/core";

import type { AppContext } from "../../lib/app-context";

export const policyDal = {
  create(context: AppContext, input: import("@toki/core").CreatePolicyInput): PolicyRule {
    const policy: PolicyRule = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };
    context.store.policies.set(policy.id, policy);
    return policy;
  },
  list(context: AppContext) {
    return Array.from(context.store.policies.values());
  }
};
