import type { ListAuditEventsQuery } from "@toki/core";

import type { AppContext } from "../../lib/app-context";
import { auditDal } from "./audit-dal";
import type { CreateAuditEventInput } from "./audit-types";

export const auditService = {
  create(context: AppContext, input: CreateAuditEventInput) {
    return auditDal.create(context, input);
  },
  list(context: AppContext, filter: ListAuditEventsQuery) {
    return auditDal
      .list(context)
      .filter((event) => {
      if (filter.actorType && event.actorType !== filter.actorType) return false;
      if (filter.actorId && event.actorId !== filter.actorId) return false;
      if (filter.eventType && event.eventType !== filter.eventType) return false;
      return true;
      })
      .slice(0, filter.limit);
  }
};
