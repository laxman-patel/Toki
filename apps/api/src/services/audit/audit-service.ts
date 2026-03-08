import type { ListAuditEventsQuery } from "@toki/core";

import type { CreateAuditEventInput } from "./audit-types";

export const auditServiceFactory = (
  auditDal: ReturnType<typeof import("./audit-dal").auditDalFactory>
) => ({
  create(input: CreateAuditEventInput) {
    return auditDal.create(input);
  },
  list(filter: ListAuditEventsQuery) {
    return auditDal.list().filter((event) => {
      if (filter.actorType && event.actorType !== filter.actorType) return false;
      if (filter.actorId && event.actorId !== filter.actorId) return false;
      if (filter.eventType && event.eventType !== filter.eventType) return false;
      return true;
    }).slice(0, filter.limit);
  }
});
