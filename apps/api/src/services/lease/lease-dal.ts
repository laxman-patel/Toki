import type { Lease } from "@toki/core";

import type { AppStore } from "../../lib/store";

export const leaseDalFactory = (store: AppStore) => ({
  create(input: Omit<Lease, "id">): Lease {
    const lease: Lease = {
      id: crypto.randomUUID(),
      ...input
    };
    store.leases.set(lease.id, lease);
    return lease;
  },
  findById(id: string) {
    return store.leases.get(id);
  },
  update(lease: Lease) {
    store.leases.set(lease.id, lease);
    return lease;
  }
});
