import type { AuditEvent } from "@toki/core";

import type { AppContext } from "../../lib/app-context";
import type { CreateAuditEventInput } from "./audit-types";

export const auditDal = {
  create(context: AppContext, input: CreateAuditEventInput): AuditEvent {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };
    context.store.auditEvents.unshift(event);
    return event;
  },
  list(context: AppContext) {
    return context.store.auditEvents;
  }
};
