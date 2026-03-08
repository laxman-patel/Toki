import type { Lease } from "@toki/core";

import type { AppContext } from "../../lib/app-context";

export const leaseDal = {
  create(context: AppContext, input: Omit<Lease, "id">): Lease {
    const lease: Lease = {
      id: crypto.randomUUID(),
      ...input
    };
    context.store.leases.set(lease.id, lease);
    return lease;
  },
  findById(context: AppContext, id: string) {
    return context.store.leases.get(id);
  },
  update(context: AppContext, lease: Lease) {
    context.store.leases.set(lease.id, lease);
    return lease;
  }
};
