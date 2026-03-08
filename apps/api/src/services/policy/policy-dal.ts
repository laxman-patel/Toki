import type { PolicyRule } from "@toki/core";

import type { AppStore } from "../../lib/store";

export const policyDalFactory = (store: AppStore) => ({
  create(input: import("@toki/core").CreatePolicyInput): PolicyRule {
    const policy: PolicyRule = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };
    store.policies.set(policy.id, policy);
    return policy;
  },
  list() {
    return Array.from(store.policies.values());
  }
});
